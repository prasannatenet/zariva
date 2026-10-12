import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplyCouponMutation, useGetCartQuery } from "../../../store/api/authApi";
import { useGetCouponsQuery } from "../../../store/api/productApi";
import "./Checkout.css";

function Checkout() {
    const { data, isLoading, isError, error } = useGetCartQuery();
    const { data: couponsData, isLoading: areCouponsLoading, isError: areCouponsError } = useGetCouponsQuery();
    const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();
    const [couponCode, setCouponCode] = useState("");
    const [couponFeedback, setCouponFeedback] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const cart = data?.data?.cart ?? data?.data ?? data;
    const items = Array.isArray(cart)
        ? cart
        : cart?.items ?? cart?.cart_items ?? cart?.products ?? [];
    const cartMeta = data?.meta ?? cart?.meta ?? {};
    const subtotal = Number(cartMeta.subtotal ?? cart?.subtotal ?? 0);
    const total = Number(cartMeta.total ?? cart?.total ?? subtotal);
    const requiresLogin = error?.status === 401;
    const coupons = Array.isArray(couponsData?.data) ? couponsData.data : [];
    const couponResult = appliedCoupon?.data?.coupon ?? appliedCoupon?.coupon ?? appliedCoupon?.data ?? appliedCoupon;
    const couponDiscount = Number(
        cartMeta.coupon_discount
        ?? cartMeta.discount_amount
        ?? cart?.coupon_discount
        ?? cart?.discount_amount
        ?? couponResult?.discount_amount
        ?? couponResult?.coupon_discount
        ?? 0
    );

    const handleApplyCoupon = async (code = couponCode) => {
        const normalizedCode = code.trim();
        if (!normalizedCode) {
            setCouponFeedback({ type: "error", message: "Enter a coupon code to apply." });
            return;
        }

        setCouponFeedback(null);
        try {
            const result = await applyCoupon(normalizedCode).unwrap();
            if (result?.success === false) {
                setCouponFeedback({
                    type: "error",
                    message: result.message || "This coupon could not be applied.",
                });
                return;
            }

            setCouponCode(normalizedCode);
            setAppliedCoupon(result);
            setCouponFeedback({
                type: "success",
                message: result.message || `${normalizedCode} applied successfully.`,
            });
        } catch (applyError) {
            setCouponFeedback({
                type: "error",
                message: applyError.data?.message || "Could not apply this coupon. Please check the code and try again.",
            });
        }
    };

    const handleCouponSubmit = (event) => {
        event.preventDefault();
        handleApplyCoupon();
    };

    return (
        <section className="checkout-page">
            <div className="checkout-page__container">
                <div className="checkout-page__heading">
                    <p className="checkout-page__eyebrow">VASHU JEWELS &amp; CRAFTS / CHECKOUT</p>
                    <h1>Complete your order</h1>
                    <p>Review your pieces and add delivery details.</p>
                </div>

                {isLoading ? (
                    <p className="checkout-page__message">Loading your cart...</p>
                ) : requiresLogin ? (
                    <div className="checkout-page__notice" role="alert">
                        <h2>Sign in to continue</h2>
                        <p>Your cart is linked to your account. Sign in to see your items and continue checkout.</p>
                        <Link to="/login" state={{ backgroundLocation: { pathname: "/checkout", search: "", hash: "" } }}>
                            Sign in
                        </Link>
                    </div>
                ) : isError ? (
                    <p className="checkout-page__notice" role="alert">We couldn't load your cart. Please try again.</p>
                ) : items.length === 0 ? (
                    <div className="checkout-page__notice">
                        <h2>Your cart is empty</h2>
                        <p>Add a piece to your cart before checking out.</p>
                        <Link to="/">Continue shopping</Link>
                    </div>
                ) : (
                    <div className="checkout-page__layout">
                        <form className="checkout-page__form">
                            <fieldset>
                                <legend>Contact details</legend>
                                <label>
                                    Full name
                                    <input name="name" type="text" autoComplete="name" required />
                                </label>
                                <div className="checkout-page__field-row">
                                    <label>
                                        Email
                                        <input name="email" type="email" autoComplete="email" required />
                                    </label>
                                    <label>
                                        Phone
                                        <input name="phone" type="tel" autoComplete="tel" required />
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Delivery address</legend>
                                <label>
                                    Address
                                    <textarea name="address" autoComplete="street-address" rows="3" required />
                                </label>
                                <div className="checkout-page__field-row">
                                    <label>
                                        City
                                        <input name="city" type="text" autoComplete="address-level2" required />
                                    </label>
                                    <label>
                                        State
                                        <input name="state" type="text" autoComplete="address-level1" required />
                                    </label>
                                    <label>
                                        PIN code
                                        <input name="postal_code" type="text" inputMode="numeric" autoComplete="postal-code" required />
                                    </label>
                                </div>
                            </fieldset>

                            <p className="checkout-page__unavailable" role="status">
                                Online order placement is not connected yet. Your cart and delivery details are ready, but this store API does not currently expose an order creation endpoint.
                            </p>
                            <button className="checkout-page__submit" type="button" disabled>
                                Place order
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
                                        value={couponCode}
                                        onChange={(event) => {
                                            setCouponCode(event.target.value);
                                            setCouponFeedback(null);
                                        }}
                                    />
                                    <button type="submit" disabled={isApplyingCoupon || !couponCode.trim()}>
                                        {isApplyingCoupon ? "Applying..." : "Apply"}
                                    </button>
                                </form>
                                {couponFeedback && (
                                    <p className={`checkout-page__coupon-feedback is-${couponFeedback.type}`} role="status">
                                        {couponFeedback.message}
                                    </p>
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
                                                <span>Min. order ₹{Number(coupon.min_order_amount || 0).toLocaleString("en-IN")}</span>
                                                {coupon.validity_text && <span>{coupon.validity_text}</span>}
                                                {!coupon.is_available && (
                                                    <span>{coupon.ineligible_reason || (coupon.is_redeemed ? "Already redeemed" : "Currently unavailable")}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                disabled={!coupon.is_available || isApplyingCoupon}
                                                onClick={() => handleApplyCoupon(coupon.code)}
                                                aria-label={`Apply coupon ${coupon.code}`}
                                            >
                                                {coupon.code}
                                                <span className="material-symbols-outlined" aria-hidden="true">local_offer</span>
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            </section>
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
                                            <strong>{lineTotal == null ? "—" : `₹${Number(lineTotal).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}</strong>
                                        </article>
                                    );
                                })}
                            </div>
                            <div className="checkout-page__total">
                                <span>Subtotal</span>
                                <strong>₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="checkout-page__discount">
                                    <span>Coupon discount</span>
                                    <strong>-₹{couponDiscount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                                </div>
                            )}
                            <div className="checkout-page__payable">
                                <span>Total</span>
                                <strong>₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                            </div>
                            <p className="checkout-page__shipping-note">Shipping and any applicable offers are confirmed at order placement.</p>
                        </aside>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Checkout;
