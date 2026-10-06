import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import { useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "swiper/css";
import "swiper/css/pagination";

import Button from "../Button/Button";
import { useAddToCartMutation } from "../../store/api/authApi";
import { toggleWishlistItem } from "../../store/slices/wishlistSlice";
import "./ProductCard.css";


const ProductCard = ({ product }) => {
    const swiperRef = useRef(null);
    const toastTimeoutRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const isWishlisted = useSelector((state) => state.wishlist.some(
        (item) => String(item.id ?? item.slug) === String(product.id ?? product.slug)
    ));

    useEffect(() => () => window.clearTimeout(toastTimeoutRef.current), []);

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
        <article
            className={`product-card ${isHovered ? "is-hovered" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="product-card__image-wrapper"
                onClick={() => navigate(`/product/${product.slug}`)}
                role="button"
                tabIndex={0}>

                {product.is_on_sale && product.discount_percentage > 0 && (
                    <span className="product-card__badge">
                        {Math.round(product.discount_percentage)}% OFF
                    </span>
                )}
                <Swiper
                    modules={[Pagination]}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    slidesPerView={1}
                    spaceBetween={0}
                    speed={600}
                    loop={true}
                    pagination={{
                        clickable: true,
                    }}
                    className="product-card__swiper"
                >
                    {product.images?.map((image, index) => (
                        <SwiperSlide key={index}>
                            <img
                                src={image}
                                alt={`${product.name} ${index + 1}`}
                                className="product-card__image"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* LEFT HOVER ZONE */}
                <div
                    className="product-card__hover-zone product-card__hover-zone--left"
                    onMouseEnter={() => {
                        swiperRef.current?.slidePrev();
                    }}
                />

                {/* RIGHT HOVER ZONE */}
                <div
                    className="product-card__hover-zone product-card__hover-zone--right"
                    onMouseEnter={() => {
                        swiperRef.current?.slideNext();
                    }}
                />

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