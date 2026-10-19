import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    useApplyCouponMutation,
    useGetCartQuery,
    useGetCheckoutSummaryQuery,
    useLazyGetPaymentStatusQuery,
    usePlaceOrderMutation,
    useVerifyRazorpayMutation,
} from "../../../store/api/authApi";
import { useGetCouponsQuery } from "../../../store/api/productApi";
import "./Checkout.css";

const EMPTY_ADDRESS = {
    billing_name: "",
    billing_email: "",
    billing_phone: "",
    billing_line1: "",
    billing_city: "",
    billing_state: "",
    billing_zip: "",
    billing_country: "India",
};

const formatPrice = (amount) => Number(amount ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
});

const sleep = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
});

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve(window.Razorpay);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
            if (window.Razorpay) {
                resolve(window.Razorpay);
            } else {
                reject(new Error("Razorpay checkout could not be initialized."));
            }
        };
        script.onerror = () => {
            script.remove();
            reject(new Error("Could not load Razorpay checkout. Please try again."));
        };
        document.body.appendChild(script);
    });
}

function getErrorMessage(error, fallback) {
    const validationErrors = error?.data?.errors;
    const firstValidationError = validationErrors && typeof validationErrors === "object"
        ? Object.values(validationErrors).flat().find((message) => typeof message === "string")
        : null;

    return firstValidationError || error?.data?.message || error?.message || fallback;
}

function Checkout() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const { data, isLoading, isError, error, refetch } = useGetCartQuery();
    const { data: couponsData, isLoading: areCouponsLoading, isError: areCouponsError } = useGetCouponsQuery();
    const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();
    const [placeOrderRequest] = usePlaceOrderMutation();
    const [verifyRazorpay] = useVerifyRazorpayMutation();
    const [getPaymentStatus] = useLazyGetPaymentStatusQuery();

    const [couponCode, setCouponCode] = useState("");
    const [couponInput, setCouponInput] = useState("");
    const [couponFeedback, setCouponFeedback] = useState(null);
    const [coins, setCoins] = useState("0");
    const [paymentMethodChoice, setPaymentMethodChoice] = useState("razorpay");
    const [address, setAddress] = useState(() => ({
        ...EMPTY_ADDRESS,
        billing_name: user?.name ?? "",
        billing_email: user?.email ?? "",
        billing_phone: user?.phone ?? "",
    }));
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [statusLine, setStatusLine] = useState("");
    const [placedOrder, setPlacedOrder] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const checkoutTokenRef = useRef(null);
    const submittingRef = useRef(false);

    const cart = data?.data?.cart ?? data?.data ?? data;
    const items = Array.isArray(cart)
        ? cart
        : cart?.items ?? cart?.cart_items ?? cart?.products ?? [];
    const requiresLogin = error?.status === 401;
    const summaryParams = {
        ...(couponCode ? { coupon_code: couponCode } : {}),
        coins: Math.max(0, Number(coins) || 0),
    };
    const {
        currentData: summaryResponse,
        isLoading: isSummaryLoading,
        isFetching: isSummaryFetching,
        isError: isSummaryError,
        error: summaryError,
    } = useGetCheckoutSummaryQuery(summaryParams, {
        skip: isLoading || isError || !items.length || requiresLogin,
    });
    const summary = summaryResponse?.data;
    const pricing = summary?.pricing;
    const paymentProviders = summary?.payment_providers ?? {};
    const paymentOptions = [
        {
            method: "cod",
            title: "Cash on Delivery",
            description: "Pay when your order arrives",
            disabledDescription: "Cash on Delivery is not available right now",
        },
        {
            method: "razorpay",
            title: "Razorpay",
            description: "UPI, credit/debit cards and netbanking",
            disabledDescription: "Razorpay is not enabled by the store right now",
        },
    ].map((option) => ({
        ...option,
        enabled: Boolean(paymentProviders[option.method]?.enabled),
    }));
    const enabledPaymentMethods = paymentOptions
        .filter((option) => option.enabled)
        .map(({ method }) => method);
    const paymentMethod = enabledPaymentMethods.includes(paymentMethodChoice)
        ? paymentMethodChoice
        : enabledPaymentMethods.includes("cod")
            ? "cod"
            : enabledPaymentMethods[0] ?? "cod";
    const submitLabel = isSubmitting
        ? "Processing..."
        : `${paymentMethod === "razorpay" ? "Pay securely with Razorpay" : "Place order"}${pricing?.grand_total == null ? "" : ` · ₹${formatPrice(pricing.grand_total)}`}`;
    const coupons = Array.isArray(couponsData?.data) ? couponsData.data : [];
    const userCoinBalance = Number(summary?.user_coins?.balance ?? 0);

    useEffect(() => {
        if (summary?.checkout_token && !checkoutTokenRef.current) {
            checkoutTokenRef.current = summary.checkout_token;
        }
    }, [summary?.checkout_token]);

    const handleUnauthorized = (requestError) => {
        if (requestError?.status !== 401) return false;
        navigate("/login", {
            state: { backgroundLocation: { pathname: "/checkout", search: "", hash: "" } },
        });
        return true;
    };

    const handleCouponSubmit = async (event, code = couponInput) => {
        event?.preventDefault();
        const normalizedCode = code.trim();
        if (!normalizedCode) {
            setCouponFeedback({ type: "error", message: "Enter a coupon code to apply." });
            return;
        }

        setCouponFeedback(null);
        setFormError("");
        try {
            const result = await applyCoupon(normalizedCode).unwrap();
            if (result?.success === false) {
                setCouponFeedback({
                    type: "error",
                    message: result.message || "This coupon could not be applied.",
                });
                return;
            }

            checkoutTokenRef.current = null;
            setCouponCode(normalizedCode);
            setCouponInput(normalizedCode);
            setCouponFeedback({
                type: "success",
                message: result.message || `${normalizedCode} applied. Updated totals are shown below.`,
            });
        } catch (couponError) {
            if (handleUnauthorized(couponError)) return;
            setCouponFeedback({
                type: "error",
                message: getErrorMessage(couponError, "Could not apply this coupon. Please check the code and try again."),
            });
        }
    };

    const handleAddressChange = (event) => {
        const { name, value } = event.target;
        setAddress((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: undefined }));
    };

    const handleCoinsChange = (event) => {
        checkoutTokenRef.current = null;
        setCoins(event.target.value);
    };

    const pollPaymentStatus = async (orderId) => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            setStatusLine("Confirming your payment...");
            const response = await getPaymentStatus(orderId).unwrap();
            const state = response?.data?.state;
            if (state === "paid" || state === "failed" || state === "cod_confirmed") {
                return state;
            }
            if (attempt < 4) await sleep(1500);
        }
        return "processing";
    };

    const handleCheckPaymentStatus = async () => {
        if (!pendingPaymentOrder || isCheckingPayment) return;

        setIsCheckingPayment(true);
        setFormError("");
        setStatusLine("Checking payment status...");
        try {
            const response = await getPaymentStatus(pendingPaymentOrder.id).unwrap();
            const state = response?.data?.state;
            if (state === "paid") {
                setPlacedOrder({ ...pendingPaymentOrder, payment_status: "paid" });
                setPendingPaymentOrder(null);
            } else if (state === "failed") {
                setFormError("Payment was not completed. You can safely retry; the same checkout token prevents a duplicate order.");
            } else {
                setFormError("Payment is still being confirmed by Razorpay. Please check the status again shortly.");
            }
        } catch (statusError) {
            if (!handleUnauthorized(statusError)) {
                setFormError(getErrorMessage(statusError, "We couldn't confirm the payment status. Please try again."));
            }
        } finally {
            setStatusLine("");
            setIsCheckingPayment(false);
        }
    };

    const openRazorpay = async (order) => {
        const paymentDetails = order?.razorpay;
        if (
            !order?.order?.id
            || !paymentDetails?.key
            || !paymentDetails?.order_id
            || !paymentDetails?.currency
            || !Number.isFinite(Number(paymentDetails.amount))
            || Number(paymentDetails.amount) <= 0
        ) {
            throw new Error("The payment gateway returned incomplete payment details. Please contact support before retrying.");
        }

        const Razorpay = await loadRazorpayScript();
        setStatusLine("Opening secure payment...");

        return new Promise((resolve) => {
            let settled = false;
            const finish = (state) => {
                if (settled) return;
                settled = true;
                resolve(state);
            };
            const checkAfterPopup = async () => {
                try {
                    finish(await pollPaymentStatus(order.order.id));
                } catch (statusError) {
                    setFormError(getErrorMessage(statusError, "We couldn't confirm the payment status. Please check your orders before trying again."));
                    finish("unknown");
                }
            };

            const payment = new Razorpay({
                ...order.razorpay,
                handler: async (response) => {
                    try {
                        const verified = await verifyRazorpay({
                            order_id: order.order.id,
                            ...response,
                        }).unwrap();
                        finish(verified?.data?.payment_status === "paid" ? "paid" : await pollPaymentStatus(order.order.id));
                    } catch {
                        await checkAfterPopup();
                    }
                },
                modal: {
                    ondismiss: checkAfterPopup,
                },
            });

            payment.open();
        });
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        if (submittingRef.current) return;

        submittingRef.current = true;
        setIsSubmitting(true);
        setFieldErrors({});
        setFormError("");
        setStatusLine("");

        try {
            const checkoutToken = checkoutTokenRef.current ?? summary?.checkout_token;
            if (!checkoutToken) {
                throw new Error("Checkout totals are still loading. Please try again.");
            }
            if (!enabledPaymentMethods.includes(paymentMethod)) {
                throw new Error("The selected payment method is not currently available.");
            }

            const placed = await placeOrderRequest({
                payment_method: paymentMethod,
                checkout_token: checkoutToken,
                ...(couponCode ? { coupon_code: couponCode } : {}),
                coins: Math.max(0, Number(coins) || 0),
                ...address,
                shipping_same_as_billing: true,
            }).unwrap();
            const order = placed?.data;

            if (order?.payment_method === "cod" || order?.is_paid) {
                setPlacedOrder(order.order);
                return;
            }

            if (order?.payment_method !== "razorpay") {
                throw new Error("The order was created, but its payment details were not returned. Please check your orders before retrying.");
            }

            setPendingPaymentOrder(order.order);
            const paymentState = await openRazorpay(order);
            setStatusLine("");
            if (paymentState === "paid") {
                setPlacedOrder({ ...order.order, payment_status: "paid" });
                setPendingPaymentOrder(null);
            } else if (paymentState === "failed") {
                setFormError("Payment was not completed. You can safely retry; the same checkout token prevents a duplicate order.");
            } else {
                setFormError("Payment is not confirmed yet. Check your orders or retry payment; do not place a separate order.");
            }
        } catch (requestError) {
            if (!handleUnauthorized(requestError)) {
                setFieldErrors(requestError?.data?.errors ?? {});
                setFormError(getErrorMessage(requestError, "We couldn't place your order. Please try again."));
            }
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const renderFieldError = (name) => {
        const value = fieldErrors[name];
        const message = Array.isArray(value) ? value[0] : value;
        return typeof message === "string"
            ? <span className="checkout-page__field-error">{message}</span>
            : null;
    };

    if (placedOrder) {
        return (
            <section className="checkout-page">
                <div className="checkout-page__container">
                    <div className="checkout-page__notice checkout-page__confirmation" role="status">
                        <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                        <p className="checkout-page__eyebrow">VASHU JEWELS &amp; CRAFTS / ORDER CONFIRMED</p>
                        <h1>Thank you for your order.</h1>
                        <p>
                            Order <strong>#{placedOrder.order_number ?? placedOrder.id}</strong>
                            {placedOrder.payment_method === "cod"
                                ? " is confirmed. Payment is due on delivery."
                                : " has been paid successfully."}
                        </p>
                        <Link to="/account">Continue to your account</Link>
                        <Link to="/">Continue shopping</Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="checkout-page">
            <div className="checkout-page__container">
                <div className="checkout-page__heading">
                    <p className="checkout-page__eyebrow">VASHU JEWELS &amp; CRAFTS / CHECKOUT</p>
                    <h1>Complete your order</h1>
                    <p>Review your pieces, add delivery details, and choose how to pay.</p>
                </div>

                {isLoading ? (
                    <p className="checkout-page__message" role="status">Loading your cart...</p>
                ) : requiresLogin ? (
                    <div className="checkout-page__notice" role="alert">
                        <h2>Sign in to continue</h2>
                        <p>Your cart is linked to your account. Sign in to see your items and the payment methods available for this order, including Cash on Delivery or online payment when enabled.</p>
                        <Link to="/login" state={{ backgroundLocation: { pathname: "/checkout", search: "", hash: "" } }}>
                            Sign in
                        </Link>
                    </div>
                ) : isError ? (
                    <div className="checkout-page__notice" role="alert">
                        <h2>We couldn't load your cart</h2>
                        <p>{getErrorMessage(error, "Please try again. If the problem continues, contact support.")}</p>
                        <button type="button" onClick={refetch}>Try again</button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="checkout-page__notice">
                        <h2>Your cart is empty</h2>
                        <p>Add a piece to your cart before checking out.</p>
                        <Link to="/">Continue shopping</Link>
                    </div>
                ) : (
                    <div className="checkout-page__layout">
                        <form className="checkout-page__form" onSubmit={handlePlaceOrder}>
                            <fieldset>
                                <legend>Contact details</legend>
                                <label>
                                    Full name
                                    <input name="billing_name" value={address.billing_name} onChange={handleAddressChange} autoComplete="name" required maxLength="100" />
                                    {renderFieldError("billing_name")}
                                </label>
                                <div className="checkout-page__field-row">
                                    <label>
                                        Email
                                        <input name="billing_email" type="email" value={address.billing_email} onChange={handleAddressChange} autoComplete="email" required maxLength="100" />
                                        {renderFieldError("billing_email")}
                                    </label>
                                    <label>
                                        Phone
                                        <input name="billing_phone" type="tel" value={address.billing_phone} onChange={handleAddressChange} autoComplete="tel" required maxLength="20" />
                                        {renderFieldError("billing_phone")}
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Delivery address</legend>
                                <label>
                                    Address
                                    <textarea name="billing_line1" value={address.billing_line1} onChange={handleAddressChange} autoComplete="street-address" rows="3" required maxLength="255" />
                                    {renderFieldError("billing_line1")}
                                </label>
                                <div className="checkout-page__field-row">
                                    <label>
                                        City
                                        <input name="billing_city" value={address.billing_city} onChange={handleAddressChange} autoComplete="address-level2" required maxLength="100" />
                                        {renderFieldError("billing_city")}
                                    </label>
                                    <label>
                                        State
                                        <input name="billing_state" value={address.billing_state} onChange={handleAddressChange} autoComplete="address-level1" required maxLength="100" />
                                        {renderFieldError("billing_state")}
                                    </label>
                                    <label>
                                        PIN code
                                        <input name="billing_zip" value={address.billing_zip} onChange={handleAddressChange} inputMode="numeric" autoComplete="postal-code" required maxLength="20" />
                                        {renderFieldError("billing_zip")}
                                    </label>
                                </div>
                                <label>
                                    Country
                                    <input name="billing_country" value={address.billing_country} onChange={handleAddressChange} autoComplete="country-name" required maxLength="100" />
                                    {renderFieldError("billing_country")}
                                </label>
                            </fieldset>

                            <fieldset className="checkout-page__payment">
                                <legend>Payment method</legend>
                                {paymentOptions.map(({ method, title, description, disabledDescription, enabled }) => (
                                    <label
                                        className={`checkout-page__payment-option${enabled ? "" : " is-unavailable"}`}
                                        key={method}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method}
                                            checked={paymentMethod === method}
                                            disabled={!enabled}
                                            onChange={() => setPaymentMethodChoice(method)}
                                        />
                                        <span>
                                            <strong>{title}</strong>
                                            <small>{enabled ? description : disabledDescription}</small>
                                        </span>
                                    </label>
                                ))}
                            </fieldset>

                            {formError && (
                                <p className="checkout-page__form-error" role="alert">
                                    {formError}{" "}
                                    {formError.toLowerCase().includes("session") && (
                                        <Link to="/login" state={{ backgroundLocation: { pathname: "/checkout", search: "", hash: "" } }}>Sign in again</Link>
                                    )}
                                </p>
                            )}
                            {statusLine && <p className="checkout-page__status" role="status">{statusLine}</p>}
                            {pendingPaymentOrder && (
                                <button
                                    className="checkout-page__payment-status-check"
                                    type="button"
                                    onClick={handleCheckPaymentStatus}
                                    disabled={isSubmitting || isCheckingPayment}
                                >
                                    {isCheckingPayment ? "Checking payment..." : "Check payment status"}
                                </button>
                            )}
                            {isSummaryError && (
                                <p className="checkout-page__form-error" role="alert">
                                    {getErrorMessage(summaryError, "Checkout totals could not be loaded. Please refresh and try again.")}
                                </p>
                            )}
                            <button
                                className="checkout-page__submit"
                                type="submit"
                                disabled={isSubmitting || isCheckingPayment || isSummaryLoading || isSummaryFetching || isSummaryError || !summary?.checkout_token || enabledPaymentMethods.length === 0}
                            >
                                {submitLabel}
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                            </button>
                        </form>

                        <aside className="checkout-page__summary" aria-labelledby="checkout-summary-title">
                            <h2 id="checkout-summary-title">Order summary</h2>
                            <section className="checkout-page__coupons" aria-label="Apply coupon">
                                <h3>Coupon code</h3>
                                <form onSubmit={handleCouponSubmit}>
                                    <input
                                        type="text"
                                        aria-label="Coupon code"
                                        placeholder="Enter coupon code"
                                        value={couponInput}
                                        onChange={(event) => setCouponInput(event.target.value)}
                                    />
                                    <button type="submit" disabled={isApplyingCoupon || !couponInput.trim()}>
                                        {isApplyingCoupon ? "Applying..." : "Apply"}
                                    </button>
                                </form>
                                {couponFeedback && (
                                    <p className={`checkout-page__coupon-feedback is-${couponFeedback.type}`} role="status">
                                        {couponFeedback.message}
                                    </p>
                                )}
                                {couponCode && (
                                    <button
                                        className="checkout-page__remove-coupon"
                                        type="button"
                                        onClick={() => {
                                            checkoutTokenRef.current = null;
                                            setCouponCode("");
                                            setCouponInput("");
                                            setCouponFeedback({ type: "success", message: "Coupon removed. Totals are updating." });
                                        }}
                                    >
                                        Remove {couponCode}
                                    </button>
                                )}
                                <div className="checkout-page__coupon-list">
                                    {areCouponsLoading ? (
                                        <p>Loading available coupons...</p>
                                    ) : areCouponsError ? (
                                        <p role="status">Available coupons could not be loaded.</p>
                                    ) : coupons.length === 0 ? (
                                        <p>No coupons are available right now.</p>
                                    ) : coupons.map((coupon) => (
                                        <article
                                            className={`checkout-page__coupon-card${coupon.is_available ? "" : " is-unavailable"}`}
                                            key={coupon.code}
                                        >
                                            <div>
                                                <strong>{coupon.offer_text || "Special offer"}</strong>
                                                <span>Min. order ₹{formatPrice(coupon.min_order_amount)}</span>
                                                {coupon.validity_text && <span>{coupon.validity_text}</span>}
                                                {!coupon.is_available && (
                                                    <span>{coupon.ineligible_reason || (coupon.is_redeemed ? "Already redeemed" : "Currently unavailable")}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                disabled={!coupon.is_available || isApplyingCoupon}
                                                onClick={(event) => handleCouponSubmit(event, coupon.code)}
                                                aria-label={`Apply coupon ${coupon.code}`}
                                            >
                                                {coupon.code}
                                                <span className="material-symbols-outlined" aria-hidden="true">local_offer</span>
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <label className="checkout-page__coins">
                                Use Gehna Coins
                                <span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={userCoinBalance}
                                        step="1"
                                        value={coins}
                                        onChange={handleCoinsChange}
                                        disabled={!userCoinBalance}
                                    />
                                    <small>{userCoinBalance} available</small>
                                </span>
                            </label>

                            <div className="checkout-page__items">
                                {items.map((item, index) => {
                                    const product = item.combo ?? item.product ?? item;
                                    const image = product.primary_image ?? product.image ?? product.images?.[0];
                                    const imageUrl = typeof image === "string" ? image : image?.url ?? image?.src;
                                    const quantity = Number(item.quantity ?? item.qty ?? 1);
                                    const lineTotal = item.line_total ?? item.total;
                                    return (
                                        <article className="checkout-page__item" key={item.id ?? product.id ?? index}>
                                            <div className="checkout-page__item-image">
                                                {imageUrl && <img src={imageUrl} alt={product.name ?? "Cart item"} />}
                                            </div>
                                            <div className="checkout-page__item-info">
                                                <h3>{product.name ?? item.name ?? "Jewellery piece"}</h3>
                                                <p>Qty {quantity}</p>
                                            </div>
                                            <strong>{lineTotal == null ? "—" : `₹${formatPrice(lineTotal)}`}</strong>
                                        </article>
                                    );
                                })}
                            </div>

                            {pricing ? (
                                <>
                                    <div className="checkout-page__total">
                                        <span>Subtotal</span>
                                        <strong>₹{formatPrice(pricing.subtotal)}</strong>
                                    </div>
                                    {Number(pricing.combo_discount) > 0 && (
                                        <div className="checkout-page__discount">
                                            <span>Combo savings</span>
                                            <strong>-₹{formatPrice(pricing.combo_discount)}</strong>
                                        </div>
                                    )}
                                    {Number(pricing.coupon_discount) > 0 && (
                                        <div className="checkout-page__discount">
                                            <span>Coupon discount</span>
                                            <strong>-₹{formatPrice(pricing.coupon_discount)}</strong>
                                        </div>
                                    )}
                                    {Number(pricing.coins_discount) > 0 && (
                                        <div className="checkout-page__discount">
                                            <span>Coins discount</span>
                                            <strong>-₹{formatPrice(pricing.coins_discount)}</strong>
                                        </div>
                                    )}
                                    <div className="checkout-page__total">
                                        <span>Shipping</span>
                                        <strong>{Number(pricing.shipping_charge) ? `₹${formatPrice(pricing.shipping_charge)}` : "Free"}</strong>
                                    </div>
                                    <div className="checkout-page__payable">
                                        <span>Total</span>
                                        <strong>₹{formatPrice(pricing.grand_total)}</strong>
                                    </div>
                                </>
                            ) : (
                                <p className="checkout-page__shipping-note" role="status">
                                    {isSummaryLoading ? "Loading secure checkout totals..." : "Final shipping and discounts will be confirmed by the store."}
                                </p>
                            )}
                            <p className="checkout-page__shipping-note">Your final total is calculated securely by the store.</p>
                        </aside>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Checkout;
