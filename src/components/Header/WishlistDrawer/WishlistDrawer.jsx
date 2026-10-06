import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../../Button/Button";
import { useAddToCartMutation } from "../../../store/api/authApi";
import "./WishlistDrawer.css";

function WishlistDrawer({ isOpen, onClose, onRemove }) {
    const wishlist = useSelector((state) => state.wishlist);
    const location = useLocation();
    const [addToCart, { isLoading }] = useAddToCartMutation();
    const [feedback, setFeedback] = useState(null);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [bulkFeedback, setBulkFeedback] = useState(null);
    const selectedProducts = wishlist.filter((product) =>
        selectedKeys.includes(String(product.id ?? product.slug))
    );
    const isEverythingSelected = wishlist.length > 0 && selectedProducts.length === wishlist.length;

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAddToCart = async (product) => {
        setFeedback(null);

        try {
            await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
            setFeedback({ productKey: product.id ?? product.slug, type: "success", message: "Added to your cart." });
        } catch (error) {
            setFeedback({
                productKey: product.id ?? product.slug,
                type: "error",
                message: error.status === 401
                    ? "Sign in to add this piece to your cart."
                    : error.data?.message || "Could not add this piece. Please try again.",
                requiresLogin: error.status === 401,
            });
        }
    };

    const handleAddSelectedToCart = async () => {
        setBulkFeedback(null);
        let addedCount = 0;

        for (const product of selectedProducts) {
            try {
                await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
                addedCount += 1;
            } catch (error) {
                setBulkFeedback({
                    type: "error",
                    message: error.status === 401
                        ? "Sign in to add selected pieces to your cart."
                        : error.data?.message || "Could not add selected pieces. Please try again.",
                    addedCount,
                    requiresLogin: error.status === 401,
                });
                return;
            }
        }

        setBulkFeedback({
            type: "success",
            message: `${addedCount} ${addedCount === 1 ? "piece" : "pieces"} added to your cart.`,
        });
    };

    return createPortal((
        <div
            className="wishlist-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <aside
                className="wishlist-drawer"
                id="wishlist-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="wishlist-drawer-title"
            >
                <div className="wishlist-drawer__header">
                    <div>
                        <p className="wishlist-drawer__eyebrow">SAVED FOR LATER</p>
                        <h2 id="wishlist-drawer-title">Your wishlist <span>({wishlist.length})</span></h2>
                    </div>
                    <button
                        className="wishlist-drawer__close"
                        type="button"
                        aria-label="Close wishlist"
                        onClick={onClose}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                </div>

                {wishlist.length === 0 ? (
                    <div className="wishlist-drawer__empty">
                        <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
                        <h3>Your wishlist is empty</h3>
                        <p>Save pieces you love and find them here anytime.</p>
                        <button type="button" onClick={onClose}>Continue shopping</button>
                    </div>
                ) : (
                    <>
                        <div className="wishlist-drawer__selection">
                            <label className="wishlist-select-all">
                                <input
                                    type="checkbox"
                                    checked={isEverythingSelected}
                                    onChange={() => setSelectedKeys(
                                        isEverythingSelected
                                            ? []
                                            : wishlist.map((product) => String(product.id ?? product.slug))
                                    )}
                                />
                                <span>Select all</span>
                            </label>
                            <span>{selectedProducts.length} selected</span>
                        </div>
                        <div className="wishlist-drawer__items">
                            {wishlist.map((product) => {
                                const image = product.primary_image || product.images?.[0] || product.image;
                                const imageUrl = typeof image === "string" ? image : image?.url ?? image?.src;
                                const productKey = product.id ?? product.slug;
                                const itemFeedback = feedback && String(feedback.productKey) === String(productKey)
                                    ? feedback
                                    : null;

                                return (
                                    <article className="wishlist-item" key={productKey}>
                                        <label className="wishlist-item__select">
                                            <input
                                                type="checkbox"
                                                checked={selectedKeys.includes(String(productKey))}
                                                aria-label={`Select ${product.name} to add to cart`}
                                                onChange={() => setSelectedKeys((keys) => (
                                                    keys.includes(String(productKey))
                                                        ? keys.filter((key) => key !== String(productKey))
                                                        : [...keys, String(productKey)]
                                                ))}
                                            />
                                        </label>
                                        <div className="wishlist-item__image">
                                            {imageUrl && <img src={imageUrl} alt={product.name} />}
                                        </div>
                                        <div className="wishlist-item__details">
                                            {product.slug ? (
                                                <Link to={`/product/${product.slug}`} onClick={onClose}>
                                                    {product.name}
                                                </Link>
                                            ) : <h3>{product.name}</h3>}
                                            <p>₹{Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                                            <button
                                                className="wishlist-item__cart"
                                                type="button"
                                                disabled={isLoading || !product.id}
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                <span className="material-symbols-outlined" aria-hidden="true">add_shopping_cart</span>
                                                {isLoading ? "Adding..." : "Add to cart"}
                                            </button>
                                            {itemFeedback && (
                                                <p className={`wishlist-item__feedback is-${itemFeedback.type}`} role={itemFeedback.type === "error" ? "alert" : "status"}>
                                                    {itemFeedback.message}{" "}
                                                    {itemFeedback.requiresLogin && (
                                                        <Link
                                                            to="/login"
                                                            state={{ backgroundLocation: location }}
                                                            onClick={onClose}
                                                        >Sign in</Link>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            className="wishlist-item__remove"
                                            type="button"
                                            aria-label={`Remove ${product.name} from wishlist`}
                                            title="Remove from wishlist"
                                            onClick={() => {
                                                onRemove(productKey);
                                                setSelectedKeys((keys) => keys.filter((key) => key !== String(productKey)));
                                            }}
                                        >
                                            <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                        <footer className="wishlist-drawer__footer">
                            {bulkFeedback && (
                                <p className={`wishlist-drawer__bulk-feedback is-${bulkFeedback.type}`} role={bulkFeedback.type === "error" ? "alert" : "status"}>
                                    {bulkFeedback.addedCount > 0 && `${bulkFeedback.addedCount} added. `}
                                    {bulkFeedback.message}{" "}
                                    {bulkFeedback.requiresLogin && (
                                        <Link
                                            to="/login"
                                            state={{ backgroundLocation: location }}
                                            onClick={onClose}
                                        >Sign in</Link>
                                    )}
                                </p>
                            )}
                            <Button
                                className="wishlist-drawer__add-selected"
                                fullWidth
                                text={isLoading ? "Adding..." : `Add ${selectedProducts.length} selected to cart`}
                                materialIcon="add_shopping_cart"
                                disabled={isLoading || selectedProducts.length === 0 || selectedProducts.some((product) => !product.id)}
                                onClick={handleAddSelectedToCart}
                            />
                            <p className="wishlist-drawer__note">Your saved pieces stay here on this device.</p>
                        </footer>
                    </>
                )}
            </aside>
        </div>
    ), document.body);
}

export default WishlistDrawer;