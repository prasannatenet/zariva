import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    useGetCartQuery,
    useRemoveCartItemMutation,
    useUpdateCartItemMutation,
} from "../../../store/api/authApi";
import { removeLocalCartItem, updateLocalCartItem } from "../../../store/slices/cartSlice";
import { useGetCombosQuery } from "../../../store/api/productApi";
import Button from "../../Button/Button";
import "./Cart.css";

const formatPrice = (amount) => Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
});

const getStockLimit = (item, product, combo) => {
    const directStock = item.stock_quantity
        ?? item.available_quantity
        ?? item.available_stock
        ?? combo?.stock_quantity
        ?? combo?.available_stock
        ?? product.stock_quantity;

    if (directStock != null && Number.isFinite(Number(directStock))) {
        return Math.max(0, Number(directStock));
    }

    const comboProducts = combo?.products ?? combo?.items ?? [];
    if (comboProducts.length > 0) {
        const componentStocks = comboProducts.map((component) =>
            component.stock_quantity ?? component.available_quantity
        );
        if (componentStocks.every((stock) => stock != null && Number.isFinite(Number(stock)))) {
            return Math.max(0, Math.min(...componentStocks.map(Number)));
        }
    }

    return null;
};

function Cart() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const localCart = useSelector((state) => state.cart);
    const {
        data: serverData,
        isLoading: isServerLoading,
        isError: isServerError,
        error,
        refetch,
    } = useGetCartQuery(undefined, { skip: !isAuthenticated });
    const { data: combosData } = useGetCombosQuery();
    const [cartFeedback, setCartFeedback] = useState(null);
    const [updateCartItemRequest, { isLoading: isUpdating }] = useUpdateCartItemMutation();
    const [removeCartItemRequest, { isLoading: isRemoving }] = useRemoveCartItemMutation();

    const data = isAuthenticated ? serverData : null;
    const isLoading = isAuthenticated && isServerLoading;
    const isError = isAuthenticated && isServerError;
    const cart = isAuthenticated ? (data?.data?.cart ?? data?.data ?? data) : localCart;
    const items = Array.isArray(cart)
        ? cart
        : cart?.items ?? cart?.cart_items ?? cart?.products ?? [];
    const cartMeta = data?.meta ?? cart?.meta ?? {};
    const subtotal = Number(cartMeta.subtotal ?? cart?.subtotal ?? items.reduce(
        (sum, item) => sum + Number(item.line_total ?? item.total ?? Number(item.price ?? 0) * Number(item.quantity ?? 1)),
        0
    ));
    const total = Number(cartMeta.total ?? cart?.total ?? subtotal);
    const shipping = cartMeta.shipping ?? cartMeta.shipping_fee ?? cart?.shipping ?? cart?.shipping_fee;
    const requiresLogin = isAuthenticated && error?.status === 401;
    const totalQuantity = Number(cartMeta.count ?? cart?.count ?? items.reduce(
        (total, item) => total + Number(item.quantity ?? item.qty ?? 1),
        0
    ));
    const handleQuantityChange = async (item, quantity) => {
        const cartItemId = item.cart_item_id ?? item.id;
        if (cartItemId == null) return;

        setCartFeedback(null);
        if (!isAuthenticated) {
            dispatch(updateLocalCartItem({ id: cartItemId, quantity }));
            return;
        }

        try {
            await updateCartItemRequest({ cartItemId, quantity }).unwrap();
        } catch (updateError) {
            setCartFeedback({
                type: "error",
                message: updateError.status === 401
                    ? "Sign in to update your cart."
                    : updateError.data?.message || "Could not update quantity. Please try again.",
                requiresLogin: updateError.status === 401,
            });
        }
    };

    const handleRemoveItem = async (item) => {
        const cartItemId = item.cart_item_id ?? item.id;
        if (cartItemId == null) return;

        setCartFeedback(null);
        if (!isAuthenticated) {
            dispatch(removeLocalCartItem(cartItemId));
            return;
        }

        try {
            await removeCartItemRequest(cartItemId).unwrap();
        } catch (removeError) {
            setCartFeedback({
                type: "error",
                message: removeError.status === 401
                    ? "Sign in to remove items from your cart."
                    : removeError.data?.message || "Could not remove this item. Please try again.",
                requiresLogin: removeError.status === 401,
            });
        }
    };

    return (
        <section className="cart-page">
            <div className="cart-page__container">
                <header className="cart-page__heading">
                    <p className="cart-page__eyebrow">VASHU JEWELS &amp; CRAFTS / YOUR BAG</p>
                    <h1>Your cart</h1>
                    {!isLoading && !isError && !requiresLogin && (
                        <p>{totalQuantity} {totalQuantity === 1 ? "piece" : "pieces"} in your cart</p>
                    )}
                </header>

                {isLoading ? (
                    <p className="cart-page__state">Loading your cart...</p>
                ) : requiresLogin ? (
                    <div className="cart-page__state cart-page__notice" role="alert">
                        <h2>Sign in to see your cart</h2>
                        <p>Your cart is connected to your account.</p>
                        <Link to="/login" state={{ backgroundLocation: { pathname: "/cart", search: "", hash: "" } }}>
                            Sign in
                        </Link>
                    </div>
                ) : isError ? (
                    <div className="cart-page__state cart-page__notice" role="alert">
                        <h2>We couldn't load your cart</h2>
                        <p>Please try again.</p>
                        <button type="button" onClick={refetch}>Try again</button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="cart-page__state cart-page__empty">
                        <span className="material-symbols-outlined" aria-hidden="true">shopping_bag</span>
                        <h2>Your cart is empty</h2>
                        <p>Find something you'll love wearing.</p>
                        <Link to="/">Continue shopping</Link>
                    </div>
                ) : (
                    <div className="cart-page__layout">
                        {cartFeedback && (
                            <p className={`cart-page__feedback is-${cartFeedback.type}`} role={cartFeedback.type === "error" ? "alert" : "status"}>
                                {cartFeedback.message}{" "}
                                {cartFeedback.requiresLogin && (
                                    <Link to="/login" state={{ backgroundLocation: { pathname: "/cart", search: "", hash: "" } }}>
                                        Sign in
                                    </Link>
                                )}
                            </p>
                        )}
                        <div className="cart-page__items" aria-label="Cart items">
                            {items.map((item, index) => {
                                const apiCombo = item.combo_id == null
                                    ? null
                                    : combosData?.data?.find((entry) => Number(entry.id) === Number(item.combo_id));
                                const combo = item.combo ?? apiCombo ?? (item.type === "combo" ? item : null);
                                const product = item.product ?? combo ?? item;
                                const comboProducts = combo?.products ?? combo?.items ?? [];
                                const isCombo = Boolean(combo || item.combo_id || item.type === "combo");
                                const image = product.primary_image ?? product.image ?? product.images?.[0] ?? comboProducts[0]?.primary_image;
                                const imageUrl = typeof image === "string" ? image : image?.url ?? image?.src;
                                const quantity = Number(item.quantity ?? item.qty ?? 1);
                                const price = Number(item.price ?? item.combo_price ?? combo?.combo_price ?? product.price ?? product.combo_price ?? 0);
                                const lineTotal = item.line_total ?? item.total;
                                const comboSavings = Number(item.discount_amount ?? combo?.discount_amount ?? 0);
                                const comboOriginalPrice = item.products_total ?? combo?.products_total;
                                const key = item.cart_item_id ?? item.id ?? product.id ?? product.slug ?? index;
                                const itemName = combo?.name ?? item.name ?? product.name ?? "Jewellery piece";
                                const stockLimit = getStockLimit(item, product, combo);
                                const isOutOfStock = item.in_stock === false
                                    || product.in_stock === false
                                    || comboProducts.some((component) => component.in_stock === false)
                                    || stockLimit === 0;
                                const canManageItem = item.cart_item_id != null || item.id != null;
                                const busy = isUpdating || isRemoving;

                                return (
                                    <article className={`cart-line ${isCombo ? "is-combo" : ""}`} key={key}>
                                        {product.slug ? (
                                            <Link className="cart-line__image" to={`/product/${product.slug}`}>
                                                {imageUrl && <img src={imageUrl} alt={itemName} />}
                                            </Link>
                                        ) : (
                                            <div className="cart-line__image">
                                                {imageUrl && <img src={imageUrl} alt={itemName} />}
                                            </div>
                                        )}
                                        <div className="cart-line__details">
                                            {product.slug ? (
                                                <Link className="cart-line__name" to={`/product/${product.slug}`}>
                                                    {itemName}
                                                </Link>
                                            ) : <h2 className="cart-line__name">{itemName}</h2>}
                                            {isCombo && <span className="cart-line__kind">Combo</span>}
                                            {isCombo && comboOriginalPrice != null && (
                                                <del className="cart-line__original-price">₹{formatPrice(comboOriginalPrice)}</del>
                                            )}
                                            <span className="cart-line__unit-price">
                                                ₹{formatPrice(price)} {isCombo ? "combo price" : "each"}
                                            </span>
                                            {isCombo && comboSavings > 0 && (
                                                <span className="cart-line__combo-savings">You save ₹{formatPrice(comboSavings)}</span>
                                            )}
                                            <div className="cart-line__quantity-control" aria-label={`Quantity for ${itemName}`}>
                                                <button
                                                    type="button"
                                                    aria-label={`Decrease quantity of ${itemName}`}
                                                    disabled={busy || quantity <= 1 || !canManageItem}
                                                    onClick={() => handleQuantityChange(item, quantity - 1)}
                                                >
                                                    <span className="material-symbols-outlined" aria-hidden="true">remove</span>
                                                </button>
                                                <span aria-live="polite">{quantity}</span>
                                                <button
                                                    type="button"
                                                    aria-label={`Increase quantity of ${itemName}`}
                                                    title={stockLimit == null ? "Stock limit is unavailable" : `Maximum ${stockLimit}`}
                                                    disabled={busy || !canManageItem || isOutOfStock || stockLimit == null || quantity >= stockLimit}
                                                    onClick={() => handleQuantityChange(item, quantity + 1)}
                                                >
                                                    <span className="material-symbols-outlined" aria-hidden="true">add</span>
                                                </button>
                                            </div>
                                            <span className={`cart-line__stock ${isOutOfStock ? "is-out-of-stock" : ""}`}>
                                                {isOutOfStock ? "Out of stock" : stockLimit == null ? "Stock limit unavailable" : `${stockLimit} available`}
                                            </span>
                                        </div>
                                        <strong className="cart-line__total">
                                            {lineTotal == null ? "—" : `₹${formatPrice(lineTotal)}`}
                                        </strong>
                                        <button
                                            className="cart-line__remove"
                                            type="button"
                                            aria-label={`Remove ${itemName} from cart`}
                                            title="Remove item"
                                            disabled={busy || !canManageItem}
                                            onClick={() => handleRemoveItem(item)}
                                        >
                                            <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                                        </button>
                                    </article>
                                );
                            })}
                            <Link className="cart-page__continue" to="/">
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                                Continue shopping
                            </Link>
                        </div>

                        <aside className="cart-summary" aria-labelledby="cart-summary-title">
                            <h2 id="cart-summary-title">Order summary</h2>
                            <div className="cart-summary__row">
                                <span>Subtotal</span>
                                <strong>₹{formatPrice(subtotal)}</strong>
                            </div>
                            <div className="cart-summary__row cart-summary__shipping">
                                <span>Shipping</span>
                                <strong>{shipping == null ? "Calculated at checkout" : Number(shipping) === 0 ? "Free" : `₹${formatPrice(shipping)}`}</strong>
                            </div>
                            <div className="cart-summary__total">
                                <span>Total</span>
                                <strong>₹{formatPrice(total)}</strong>
                            </div>
                            <p className="cart-summary__shipping-note">Shipping is confirmed by the API at checkout.</p>
                            <Button
                                text="Proceed to checkout"
                                materialIcon="arrow_forward"
                                fullWidth
                                className="cart-summary__checkout"
                                onClick={() => navigate("/checkout")}
                            />
                        </aside>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Cart;