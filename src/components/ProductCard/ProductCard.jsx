import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../Button/Button";
import { useAddToCartMutation } from "../../store/api/authApi";
import { addLocalCartItem } from "../../store/slices/cartSlice";
import { toggleWishlistItem } from "../../store/slices/wishlistSlice";
import "./ProductCard.css";


const ProductCard = ({ product, imageMode = "hover" }) => {
    const toastTimeoutRef = useRef(null);
    const imageHoverIntervalRef = useRef(null);
    const imageTouchStartXRef = useRef(null);
    const activeImageIndexRef = useRef(0);
    const [toast, setToast] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const isWishlisted = useSelector((state) => state.wishlist.some(
        (item) => String(item.id ?? item.slug) === String(product.id ?? product.slug)
    ));
    const primaryImage = product.primary_image || product.images?.[0];
    const secondaryImage = product.images?.find((image) => image !== primaryImage);
    const productImages = [...new Set([primaryImage, ...(product.images || [])].filter(Boolean))];

    useEffect(() => () => {
        window.clearTimeout(toastTimeoutRef.current);
        window.clearInterval(imageHoverIntervalRef.current);
    }, []);

    const stopImageHover = () => {
        window.clearInterval(imageHoverIntervalRef.current);
        imageHoverIntervalRef.current = null;
    };

    const handleImageHover = (direction) => {
        const offset = direction === "prev" ? -1 : 1;
        const nextIndex = activeImageIndexRef.current + offset;

        if (nextIndex < 0 || nextIndex >= productImages.length) {
            stopImageHover();
            return false;
        }

        activeImageIndexRef.current = nextIndex;
        setActiveImageIndex(nextIndex);
        return true;
    };

    const startImageHover = (direction) => {
        stopImageHover();
        if (!handleImageHover(direction)) {
            return;
        }

        imageHoverIntervalRef.current = window.setInterval(
            () => handleImageHover(direction),
            1100
        );
    };

    const resetImageHover = () => {
        stopImageHover();
        activeImageIndexRef.current = 0;
        setActiveImageIndex(0);
    };

    const handleImageZoneLeave = (event) => {
        if (event.relatedTarget?.classList?.contains("product-card__image-hover-zone")) {
            stopImageHover();
            return;
        }

        resetImageHover();
    };

    const handleImageTouchEnd = (event) => {
        const touchStartX = imageTouchStartXRef.current;
        imageTouchStartXRef.current = null;

        if (touchStartX === null) {
            return;
        }

        const touchDistance = event.changedTouches[0].clientX - touchStartX;

        if (Math.abs(touchDistance) > 30) {
            event.preventDefault();
            event.stopPropagation();
            handleImageHover(touchDistance > 0 ? "prev" : "next");
        }
    };

    const showToast = (nextToast) => {
        window.clearTimeout(toastTimeoutRef.current);
        setToast(nextToast);
        toastTimeoutRef.current = window.setTimeout(() => setToast(null), 2600);
    };

    const handleWishlistClick = (event) => {
        event.stopPropagation();

        if (!isWishlisted) {
            showToast({
                icon: "favorite",
                title: "Added to wishlist",
                message: product.name,
                type: "success",
            });
        } else {
            window.clearTimeout(toastTimeoutRef.current);
            setToast(null);
        }

        dispatch(toggleWishlistItem(product));
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            dispatch(addLocalCartItem({ product, quantity: 1 }));
            showToast({
                icon: "add_shopping_cart",
                title: "Added to cart",
                message: product.name,
                type: "success",
            });
            return;
        }

        try {
            await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
            showToast({
                icon: "add_shopping_cart",
                title: "Added to cart",
                message: product.name,
                type: "success",
            });
        } catch (error) {
            showToast({
                icon: "error",
                title: error.status === 401 ? "Sign in to add to cart" : "Could not add to cart",
                message: error.status === 401
                    ? "Your cart is linked to your account."
                    : error.data?.message || "Please try again in a moment.",
                type: "error",
                requiresLogin: error.status === 401,
            });
        }
    };

    return (
        <>
        <article className="product-card">
            <div
                className={`product-card__image-wrapper${imageMode === "swiper" ? " product-card__image-wrapper--swiper" : ""}`}
                onClick={() => navigate(`/product/${product.slug}`)}
                onMouseLeave={imageMode === "swiper" ? resetImageHover : undefined}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/product/${product.slug}`);
                    }
                }}
                role="button"
                tabIndex={0}
            >

                {product.is_on_sale && product.discount_percentage > 0 && (
                    <span className="product-card__badge">
                        {Math.round(product.discount_percentage)}% OFF
                    </span>
                )}
                {imageMode === "swiper" ? (
                    <>
                        <div
                            className="product-card__image-carousel"
                            onTouchStart={(event) => {
                                imageTouchStartXRef.current = event.touches[0].clientX;
                            }}
                            onTouchEnd={handleImageTouchEnd}
                        >
                            <div
                                className="product-card__image-track"
                                style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                            >
                                {productImages.map((image, index) => (
                                    <img
                                        key={image}
                                        src={image}
                                        alt={index === 0 ? product.name : `${product.name} view ${index + 1}`}
                                        className="product-card__image"
                                    />
                                ))}
                            </div>
                        </div>

                        {productImages.length > 1 && (
                            <>
                                <span
                                    className="product-card__image-hover-zone product-card__image-hover-zone--prev"
                                    aria-hidden="true"
                                    onMouseEnter={() => startImageHover("prev")}
                                    onMouseLeave={handleImageZoneLeave}
                                />
                                <span
                                    className="product-card__image-hover-zone product-card__image-hover-zone--next"
                                    aria-hidden="true"
                                    onMouseEnter={() => startImageHover("next")}
                                    onMouseLeave={handleImageZoneLeave}
                                />
                                <div className="product-card__image-pagination">
                                    {productImages.map((image, index) => (
                                        <button
                                            key={image}
                                            type="button"
                                            className={`product-card__image-dot${index === activeImageIndex ? " is-active" : ""}`}
                                            aria-label={`Show image ${index + 1} of ${product.name}`}
                                            aria-current={index === activeImageIndex ? "true" : undefined}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                activeImageIndexRef.current = index;
                                                setActiveImageIndex(index);
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {primaryImage && (
                            <img
                                src={primaryImage}
                                alt={product.name}
                                className="product-card__image product-card__image--primary"
                            />
                        )}
                        {secondaryImage && (
                            <img
                                src={secondaryImage}
                                alt={`${product.name} alternate view`}
                                className="product-card__image product-card__image--secondary"
                                aria-hidden="true"
                            />
                        )}
                    </>
                )}

                {/* WISHLIST */}
                <button
                    type="button"
                    className={`product-card__wishlist ${isWishlisted ? "is-active" : ""}`}
                    aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
                    aria-pressed={isWishlisted}
                    onClick={handleWishlistClick}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        favorite
                    </span>
                </button>

            </div>

            <div className="product-card__content">

                <div className="product-card__top">
                    <h3 title={product.name} className="product-card__name"  onClick={() => navigate(`/product/${product.slug}`)}>
                        {product.name}
                    </h3>

                    <span className="product-card__price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="product-card__rating">
                    <span className="product-card__stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`material-symbols-outlined ${star <= Math.round(product.rating || 0)
                                    ? "is-filled"
                                    : "is-empty"
                                    }`}
                            >
                                star
                            </span>
                        ))}
                    </span>

                    <span className="product-card__rating-number">
                        ({product.rating})
                    </span>
                </div>

                <Button
                    text={isAddingToCart ? "Adding..." : "Add to Cart"}
                    materialIcon="add_shopping_cart"
                    fullWidth
                    className="product-card__cart-button"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !product.id}
                />

            </div>
        </article>
        {toast && createPortal(
            <div className={`product-toast is-${toast.type}`} role={toast.type === "error" ? "alert" : "status"} aria-live={toast.type === "error" ? "assertive" : "polite"}>
                <span className="product-toast__icon material-symbols-outlined" aria-hidden="true">
                    {toast.icon}
                </span>
                <span className="product-toast__copy">
                    <strong>{toast.title}</strong>
                    <span>{toast.message}</span>
                    {toast.requiresLogin && (
                        <Link
                            to="/login"
                            state={{ backgroundLocation: location }}
                            onClick={() => setToast(null)}
                        >Sign in</Link>
                    )}
                </span>
                <button
                    className="product-toast__close"
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => {
                        window.clearTimeout(toastTimeoutRef.current);
                        setToast(null);
                    }}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
            </div>,
            document.body
        )}
        </>
    );
};

export default ProductCard;