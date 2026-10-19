import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetCombosQuery, useGetCouponsQuery, useGetProductQuery, useGetSettingsQuery } from "../../../store/api/productApi";
import { useAddToCartMutation, useGetCartQuery } from "../../../store/api/authApi";
import { toggleWishlistItem } from "../../../store/slices/wishlistSlice";
import "./ProductDetail.css";
import Button from "../../../components/Button/Button";
import ProductReviews from "./ProductReviews";

import safeCheckoutImg from "../../../assets/images/safe-checkout.png"
import paymentOption from "../../../assets/images/paymentOption.png"
import fire from "../../../assets/images/fire.gif"

const LOW_STOCK_THRESHOLD = 9;

function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const wishlist = useSelector((state) => state.wishlist);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const { data, isLoading, isError } = useGetProductQuery(slug);
    const { data: combosData } = useGetCombosQuery();
    const { data: couponsData, isLoading: areCouponsLoading, isError: areCouponsError } = useGetCouponsQuery();
    const { data: settingsData, isLoading: areSettingsLoading, isError: areSettingsError } = useGetSettingsQuery();
    const {
        data: cartData,
        isLoading: isCartLoading,
        isError: isCartError,
    } = useGetCartQuery(undefined, { skip: !isAuthenticated });
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const [variationSelection, setVariationSelection] = useState({ slug, index: 0 });
    const selectedVariationIndex = variationSelection.slug === slug ? variationSelection.index : 0;
    const [gallerySelection, setGallerySelection] = useState({ slug, variationIndex: 0, index: 0 });
    const thumbnailRailRef = useRef(null);
    const [zoomPreview, setZoomPreview] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [cartFeedback, setCartFeedback] = useState(null);
    const [shareFeedback, setShareFeedback] = useState("");
    const [couponFeedback, setCouponFeedback] = useState("");
    const [deliveryPincode, setDeliveryPincode] = useState("");
    const [pincodeFeedback, setPincodeFeedback] = useState("");

    if (isLoading) {
        return <div className="product-detail__message">Loading product...</div>;
    }

    if (isError) {
        return <div className="product-detail__message" role="alert">Unable to load this product. Please try again.</div>;
    }

    const product = data?.data?.product ?? data?.data ?? data;
    const reviews = data?.data?.reviews ?? {};

    if (!product) {
        return <div className="product-detail__message">Product not found.</div>;
    }

    const isWishlisted = wishlist.some(
        (item) => String(item.id ?? item.slug) === String(product.id ?? product.slug)
    );
    const variations = Array.isArray(product.variations) ? product.variations : [];
    const selectedVariation = variations[selectedVariationIndex] ?? variations[0] ?? null;
    const displayedProduct = selectedVariation ?? product;
    const variationImages = selectedVariation
        ? [
            ...(Array.isArray(selectedVariation.images)
                ? selectedVariation.images
                : selectedVariation.images ? [selectedVariation.images] : []),
            selectedVariation.primary_image,
            selectedVariation.image,
        ].filter(Boolean)
        : [];
    const productImages = variationImages.length
        ? variationImages
        : (product.images?.length ? product.images : [product.primary_image]);
    const rawImages = productImages
        .map((image) => typeof image === "string" ? image : image?.url ?? image?.src)
        .filter(Boolean);
    // Deduplicate images while preserving order
    const images = rawImages.filter((image, index, array) => array.indexOf(image) === index);

    const productVideos = Array.isArray(displayedProduct.videos) && displayedProduct.videos.length > 0
        ? displayedProduct.videos
        : Array.isArray(product.videos)
            ? product.videos
            : [];

    const videos = productVideos
        .map((video, index) => {
            if (!video) return null;
            if (typeof video === "string") {
                return {
                    id: `video-${index}`,
                    url: video,
                    download_url: video,
                    is_primary: index === 0,
                    thumbnail: null,
                };
            }
            const videoUrl = video.download_url || video.url;
            if (!videoUrl) return null;
            return {
                id: video.id ?? `video-${index}`,
                url: videoUrl,
                download_url: video.download_url || video.url,
                is_primary: Boolean(video.is_primary),
                thumbnail: null,
            };
        })
        .filter(Boolean);

    // Build unified gallery media items:
    // If images exist: hero image first, then videos, then remaining images.
    const mediaItems = [];
    if (images.length > 0) {
        mediaItems.push({
            type: "image",
            url: images[0],
            thumbnail: images[0],
            id: "image-0",
        });
        videos.forEach((video, index) => {
            mediaItems.push({
                type: "video",
                url: video.url,
                thumbnail: null,
                id: `video-${video.id ?? index}`,
            });
        });
        images.slice(1).forEach((img, index) => {
            mediaItems.push({
                type: "image",
                url: img,
                thumbnail: img,
                id: `image-${index + 1}`,
            });
        });
    } else if (videos.length > 0) {
        videos.forEach((video, index) => {
            mediaItems.push({
                type: "video",
                url: video.url,
                thumbnail: video.thumbnail || null,
                id: `video-${video.id ?? index}`,
            });
        });
    }

    const selectedMediaIndex = gallerySelection.slug === slug
        && gallerySelection.variationIndex === selectedVariationIndex
        ? Math.min(gallerySelection.index, Math.max(mediaItems.length - 1, 0))
        : 0;
    const selectedMedia = mediaItems[selectedMediaIndex] ?? null;
    const selectedImage = selectedMedia?.type === "image" ? selectedMedia.url : (images[0] ?? null);
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const rating = Number(reviews.summary?.average ?? product.rating) || 0;
    const reviewCount = Number(reviews.summary?.count ?? product.reviews_count ?? product.review_count ?? 0);
    const price = Number(displayedProduct.price ?? product.price);
    const regularPrice = Number(
        displayedProduct.regular_price
        ?? product.regular_price
        ?? displayedProduct.base_price
        ?? product.base_price
    );
    const discount = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;
    const stockValue = displayedProduct.stock
        ?? displayedProduct.stock_quantity
        ?? displayedProduct.available_quantity
        ?? displayedProduct.available_stock
        ?? product.stock
        ?? product.stock_quantity
        ?? product.available_quantity
        ?? product.available_stock;
    const stockQuantity = stockValue != null && Number.isFinite(Number(stockValue))
        ? Math.max(0, Number(stockValue))
        : null;
    const inStock = displayedProduct.in_stock
        ?? product.in_stock
        ?? (stockQuantity != null ? stockQuantity > 0 : false);
    const isInventoryTracked = displayedProduct.manage_stock ?? product.manage_stock ?? false;
    const isLowStock = isInventoryTracked
        && inStock
        && stockQuantity !== null
        && stockQuantity > 0
        && stockQuantity <= LOW_STOCK_THRESHOLD;
    const stockLabel = !inStock || (isInventoryTracked && stockQuantity === 0)
        ? "Out of stock"
        : stockQuantity > 15
            ? "In Stock"
            : stockQuantity !== null
                ? `${stockQuantity} Available`
                : "Available";
    const freeShippingMinimum = Number(
        settingsData?.data?.free_shipping_minimum
        ?? settingsData?.data?.settings?.free_shipping_minimum
    );
    const cart = cartData?.data?.cart ?? cartData?.data ?? cartData;
    const cartSubtotal = Number(cartData?.meta?.subtotal ?? cart?.meta?.subtotal ?? cart?.subtotal ?? 0);
    const hasFreeShippingMinimum = Number.isFinite(freeShippingMinimum) && freeShippingMinimum >= 0;
    const shippingProgress = hasFreeShippingMinimum && Number.isFinite(cartSubtotal)
        ? freeShippingMinimum === 0 ? 100 : Math.min((cartSubtotal / freeShippingMinimum) * 100, 100)
        : 0;
    const amountToFreeShipping = hasFreeShippingMinimum && Number.isFinite(cartSubtotal)
        ? Math.max(freeShippingMinimum - cartSubtotal, 0)
        : 0;
    const coupons = Array.isArray(couponsData?.data) ? couponsData.data : [];
    const shippingDateFormatter = new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
    });
    const shipsFrom = new Date();
    shipsFrom.setDate(shipsFrom.getDate() + 1);
    const shipsUntil = new Date();
    shipsUntil.setDate(shipsUntil.getDate() + 3);
    const matchingCombos = (combosData?.data || []).filter((combo) =>
        combo.is_live && combo.products?.some((item) => item.id === product.id)
    );
    const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    const getThumbnail = (item) => item.primary_image || item.images?.[0];

    const getVariationMaterial = (variation) => {
        const attributes = variation.attributes;
        const materialAttribute = Array.isArray(attributes)
            ? attributes.find((attribute) => (attribute.name ?? attribute.slug ?? attribute.key)?.toLowerCase() === "material")
            : Object.entries(attributes ?? {}).find(([name]) => name.toLowerCase() === "material")?.[1];

        if (typeof materialAttribute === "string") {
            return materialAttribute;
        }

        return materialAttribute?.value
            ?? materialAttribute?.option
            ?? materialAttribute?.label
            ?? (materialAttribute?.name?.toLowerCase() === "material" ? null : materialAttribute?.name)
            ?? variation.material
            ?? product.material
            ?? null;
    };

    const getVariationLabel = (variation, index) => variation.name
        || variation.title
        || variation.value
        || [variation.color, variation.size].filter(Boolean).join(" / ")
        || getVariationMaterial(variation)
        || `Option ${index + 1}`;

    const getVariationImage = (variation) => {
        const variationImages = Array.isArray(variation.images)
            ? variation.images
            : variation.images ? [variation.images] : [];
        const image = variationImages[0]
            ?? variation.primary_image
            ?? variation.image
            ?? product.primary_image
            ?? product.images?.[0];

        return typeof image === "string" ? image : image?.url ?? image?.src;
    };

    const getVariationStock = (variation) => variation.in_stock
        ?? (variation.stock_quantity != null
            ? Number(variation.stock_quantity) > 0
            : product.in_stock ?? Number(product.stock_quantity) > 0);

    const handleImageZoom = (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        setZoomPreview({ src: event.currentTarget.dataset.image, x, y });
    };

    const scrollThumbnails = (direction) => {
        thumbnailRailRef.current?.scrollBy({
            top: direction * 100,
            behavior: "smooth",
        });
    };

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                setShareFeedback("");
                return;
            }

            await navigator.clipboard.writeText(shareData.url);
            setShareFeedback("Link copied");
        } catch (error) {
            if (error.name !== "AbortError") {
                setShareFeedback("Could not share product");
            }
        }
    };

    const handleCopyCoupon = async (code) => {
        if (!navigator.clipboard?.writeText) {
            setCouponFeedback("Copy is not supported in this browser.");
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            setCouponFeedback(`${code} copied`);
        } catch {
            setCouponFeedback("Could not copy coupon code.");
        }
    };

    const handlePincodeCheck = (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(deliveryPincode)) {
            setPincodeFeedback("Enter a valid 6-digit pincode.");
            return;
        }

        setPincodeFeedback("Pincode noted. Delivery availability will be confirmed at checkout.");
    };

    const handleAddItemsToCart = async (items, source) => {
        setCartFeedback(null);
        let addedCount = 0;

        try {
            for (const item of items) {
                await addToCart({
                    product_id: item.id,
                    quantity: item.id === product.id ? quantity : 1,
                }).unwrap();
                addedCount += 1;
            }

            setCartFeedback({
                source,
                type: "success",
                message: items.length === 1 ? "Added to cart." : `${addedCount} items added to cart.`,
            });
            return true;
        } catch (error) {
            const message = error.status === 401
                ? "Please sign in to add items to your cart."
                : error.data?.message || "Could not add items to cart. Please try again.";

            setCartFeedback({
                source,
                type: "error",
                message: addedCount > 0 ? `${addedCount} items added. ${message}` : message,
                requiresLogin: error.status === 401,
            });
            return false;
        }
    };

    const handleProductBuyNow = async () => {
        const addedToCart = await handleAddItemsToCart([product], "product");

        if (addedToCart) {
            navigate("/checkout");
        }
    };

    const handleComboBuyNow = async (combo) => {
        const addedToCart = await handleAddComboToCart(combo);
        if (addedToCart) {
            navigate("/checkout", { state: { comboId: combo.id } });
        }
    };

    const handleAddComboToCart = async (combo) => {
        setCartFeedback(null);
        const productId = combo.products?.[0]?.id;

        if (productId == null) {
            setCartFeedback({
                source: `combo-${combo.id}`,
                type: "error",
                message: "This combo does not contain a purchasable product.",
            });
            return false;
        }

        try {
            await addToCart({ product_id: productId, combo_id: combo.id, quantity: 1 }).unwrap();
            setCartFeedback({
                source: `combo-${combo.id}`,
                type: "success",
                message: `${combo.name} added to cart at ${formatPrice(combo.combo_price)}.`,
            });
            return true;
        } catch (error) {
            setCartFeedback({
                source: `combo-${combo.id}`,
                type: "error",
                message: error.status === 401
                    ? "Please sign in to add this combo to your cart."
                    : error.data?.message || "Could not add this combo. Please try again.",
                requiresLogin: error.status === 401,
            });
            return false;
        }
    };

    const renderCartFeedback = (source) => cartFeedback?.source === source && (
        <p className={`product-detail__cart-feedback is-${cartFeedback.type}`} role={cartFeedback.type === "error" ? "alert" : "status"}>
            {cartFeedback.message} {cartFeedback.requiresLogin && <Link to="/login">Sign in</Link>}
        </p>
    );

    return (
        <>
            <div className="product-detail">
                <div className="container">
                    <div className="product-detail__layout">
                        <section className="product-detail__gallery" aria-label="Product media gallery">
                            {mediaItems.length > 0 ? (
                                <div className={`product-detail__gallery-layout${mediaItems.length === 1 ? " is-single" : ""}`}>
                                    {mediaItems.length > 1 && (
                                        <div className="product-detail__thumbnail-column">
                                            {mediaItems.length > 5 && (
                                                <button
                                                    className="product-detail__thumbnail-arrow"
                                                    type="button"
                                                    aria-label="Scroll thumbnails up"
                                                    onClick={() => scrollThumbnails(-1)}
                                                >
                                                    <span className="material-symbols-outlined" aria-hidden="true">keyboard_arrow_up</span>
                                                </button>
                                            )}
                                            <div className="product-detail__thumbnail-rail" ref={thumbnailRailRef}>
                                                {mediaItems.map((item, index) => {
                                                    const isSelected = index === selectedMediaIndex;
                                                    return (
                                                        <button
                                                            className={`product-detail__thumbnail${item.type === "video" ? " is-video" : ""}${isSelected ? " is-selected" : ""}`}
                                                            key={`${item.id}-${index}`}
                                                            type="button"
                                                            aria-label={item.type === "video" ? `Play video of ${product.name}` : `Show image ${index + 1} of ${product.name}`}
                                                            aria-pressed={isSelected}
                                                            onClick={() => {
                                                                setGallerySelection({
                                                                    slug,
                                                                    variationIndex: selectedVariationIndex,
                                                                    index,
                                                                });
                                                                setZoomPreview(null);
                                                            }}
                                                        >
                                                            {item.type === "video" ? (
                                                                <div className="product-detail__thumbnail-video-wrapper">
                                                                    <video
                                                                        className="product-detail__thumbnail-video-preview"
                                                                        src={`${item.url}#t=0.001`}
                                                                        muted
                                                                        playsInline
                                                                        preload="metadata"
                                                                    />
                                                                    <div className="product-detail__thumbnail-play-overlay">
                                                                        <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <img src={item.url} alt="" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {mediaItems.length > 5 && (
                                                <button
                                                    className="product-detail__thumbnail-arrow"
                                                    type="button"
                                                    aria-label="Scroll thumbnails down"
                                                    onClick={() => scrollThumbnails(1)}
                                                >
                                                    <span className="material-symbols-outlined" aria-hidden="true">keyboard_arrow_down</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {selectedMedia?.type === "video" ? (
                                        <div className="product-detail__main-image product-detail__main-image--video">
                                            <video
                                                key={selectedMedia.url}
                                                className="product-detail__main-video"
                                                src={selectedMedia.url}
                                                controls
                                                controlsList="nodownload noplaybackrate"
                                                disablePictureInPicture
                                                onContextMenu={(e) => e.preventDefault()}
                                                autoPlay
                                                muted
                                                playsInline
                                                loop
                                                preload="metadata"
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                            {discount > 0 && (
                                                <span className="product-detail__image-discount">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className="product-detail__main-image"
                                            data-image={selectedImage}
                                            onMouseMove={handleImageZoom}
                                            onMouseLeave={() => setZoomPreview(null)}
                                        >
                                            <img
                                                src={selectedImage}
                                                alt={`${product.name} view ${selectedMediaIndex + 1}`}
                                            />
                                            {discount > 0 && (
                                                <span className="product-detail__image-discount">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="trustBar">
                                        <div className="trustPanel">
                                            <span className="material-symbols-outlined">
                                                security
                                            </span>
                                            <div>100% Authentic</div>
                                        </div>
                                        <div className="trustPanel">
                                            <span className="material-symbols-outlined">
                                                loyalty
                                            </span>
                                            <div>Best Price Guaranteed</div>
                                        </div>
                                        <div className="trustPanel">
                                            <span className="material-symbols-outlined">
                                                delivery_truck_speed
                                            </span>
                                            <div>Quick Shipping</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="product-detail__image-placeholder">Media unavailable</div>
                            )}
                            {zoomPreview && selectedMedia?.type === "image" && (
                                <div className="product-detail__zoom-preview" aria-hidden="true">
                                    <img
                                        src={zoomPreview.src}
                                        alt=""
                                        style={{ transformOrigin: `${zoomPreview.x}% ${zoomPreview.y}%` }}
                                    />
                                </div>
                            )}
                        </section>

                        <section className="product-detail__info">
                            {product.sku && <p className="product-detail__sku">SKU: {product.sku}</p>}
                            <div className="product-detail__title-row">
                                <h1>{product.name}</h1>
                                <button
                                    className={`product-detail__share product-detail__wishlist${isWishlisted ? " is-active" : ""}`}
                                    type="button"
                                    aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
                                    aria-pressed={isWishlisted}
                                    onClick={() => dispatch(toggleWishlistItem(product))}
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
                                </button>
                                <button
                                    className="product-detail__share"
                                    type="button"
                                    aria-label={`Share ${product.name}`}
                                    onClick={handleShare}
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">share</span>
                                </button>
                            </div>
                            {shareFeedback && (
                                <span className="product-detail__share-feedback" role="status">
                                    {shareFeedback}
                                </span>
                            )}
                            <a className="product-detail__rating" href="#product-reviews" aria-label={`Rated ${rating.toFixed(1)} out of 5, ${reviewCount} reviews`}>
                                <span className="product-detail__stars" aria-hidden="true">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            className={`material-symbols-outlined ${rating >= star - 0.5 ? "is-filled" : ""}`}
                                            key={star}
                                        >star</span>
                                    ))}
                                </span>
                                <strong>{rating.toFixed(1)}</strong>
                                <span>{reviewCount} Reviews</span>
                            </a>

                            <div className="product-detail__price">
                                <span className="product-detail__current-price">
                                    {Number.isFinite(price) ? formatPrice(price) : "Price unavailable"}
                                </span>
                                {regularPrice > price && (
                                    <>
                                        <del className="product-detail__regular-price">{formatPrice(regularPrice)}</del>
                                        <span className="product-detail__discount">
                                            {formatPrice(regularPrice - price)} saved · {discount}% off
                                        </span>
                                    </>
                                )}
                                {isLowStock ? (
                                    <div className="product-detail__low-stock" role="status">
                                        <p><img src={fire} alt="" /> Hurry! Only <strong>{stockQuantity}</strong> left in stock</p>
                                    </div>
                                ) : (
                                    <span className={`product-detail__availability${inStock ? " is-in-stock" : " is-out-of-stock"}`}>
                                        {stockLabel}
                                    </span>
                                )}
                            </div>

                            <span className="texesInfo">(Incl of all Taxes)</span>

                            <div className="product-detail__shipping">
                                <p className="product-detail__shipping-estimate">
                                    <span className="material-symbols-outlined" aria-hidden="true">local_shipping</span>
                                    <span>
                                        Ships between <strong>{shippingDateFormatter.format(shipsFrom)}</strong>
                                        {" and "}
                                        <strong>{shippingDateFormatter.format(shipsUntil)}</strong>
                                    </span>
                                </p>
                                <div className="product-detail__shipping-benefits">
                                    <div className="product-detail__free-shipping">
                                        {areSettingsLoading ? (
                                            <p>Loading free-shipping offer...</p>
                                        ) : areSettingsError || !hasFreeShippingMinimum ? (
                                            <p role="status">Free-shipping information is currently unavailable.</p>
                                        ) : isAuthenticated && isCartLoading ? (
                                            <p>Checking your cart for free shipping...</p>
                                        ) : isAuthenticated && isCartError ? (
                                            <p role="status">Unable to check your cart for free shipping.</p>
                                        ) : !isAuthenticated ? (
                                            <p>Add items to your cart to track free-shipping progress.</p>
                                        ) : (
                                            <>
                                                <p>
                                                    {amountToFreeShipping > 0 ? (
                                                        <>Add <strong>{formatPrice(amountToFreeShipping)}</strong> more to unlock <strong>FREE shipping</strong></>
                                                    ) : (
                                                        <>You unlocked <strong>FREE shipping</strong></>
                                                    )}
                                                </p>
                                                <div
                                                    className="product-detail__shipping-progress"
                                                    role="progressbar"
                                                    aria-label="Free shipping progress"
                                                    aria-valuemin={0}
                                                    aria-valuemax={freeShippingMinimum}
                                                    aria-valuenow={Math.min(cartSubtotal, freeShippingMinimum)}
                                                >
                                                    <span style={{ width: `${shippingProgress}%` }} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <form className="product-detail__pincode-check" onSubmit={handlePincodeCheck}>
                                        <label htmlFor="product-delivery-pincode">Enter your pincode</label>
                                        <div className="product-detail__pincode-controls">
                                            <input
                                                id="product-delivery-pincode"
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="postal-code"
                                                maxLength={6}
                                                placeholder="6-digit pincode"
                                                value={deliveryPincode}
                                                onChange={(event) => {
                                                    setDeliveryPincode(event.target.value.replace(/\D/g, "").slice(0, 6));
                                                    setPincodeFeedback("");
                                                }}
                                            />
                                            <button type="submit" disabled={deliveryPincode.length !== 6}>Check</button>
                                        </div>
                                        {pincodeFeedback && <p className="product-detail__pincode-feedback" role="status">{pincodeFeedback}</p>}
                                    </form>
                                </div>

                                <section className="product-detail__coupons" aria-label="Available coupons">
                                    <h2>Available Coupons</h2>
                                    {areCouponsLoading ? (
                                        <p className="product-detail__coupons-message">Loading coupons...</p>
                                    ) : areCouponsError ? (
                                        <p className="product-detail__coupons-message is-error" role="alert">
                                            Coupons are unavailable right now.
                                        </p>
                                    ) : coupons.length === 0 ? (
                                        <p className="product-detail__coupons-message">No coupons are available right now.</p>
                                    ) : (
                                        <div className="product-detail__coupon-list">
                                            {coupons.map((coupon) => (
                                                <article
                                                    className={`product-detail__coupon${coupon.is_available ? "" : " is-unavailable"}`}
                                                    key={coupon.code}
                                                >
                                                    <div className="product-detail__coupon-copy">
                                                        <strong>{coupon.offer_text || "Special offer"}</strong>
                                                        <span>Min. order {formatPrice(coupon.min_order_amount)}</span>
                                                        {coupon.validity_text && <span>{coupon.validity_text}</span>}
                                                        {!coupon.is_available && (
                                                            <span>{coupon.ineligible_reason || (coupon.is_redeemed ? "Already redeemed" : "Currently unavailable")}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="product-detail__coupon-code"
                                                        onClick={() => handleCopyCoupon(coupon.code)}
                                                        disabled={!coupon.is_available}
                                                        aria-label={`Copy coupon ${coupon.code}`}
                                                    >
                                                        {coupon.code}
                                                        {coupon.is_available && (
                                                            <span className="material-symbols-outlined" aria-hidden="true">content_copy</span>
                                                        )}
                                                    </button>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                    {couponFeedback && <p className="product-detail__coupon-feedback" role="status">{couponFeedback}</p>}
                                </section>
                            </div>

                            {variations.length > 0 && (
                                <fieldset className="product-detail__options">
                                    <legend>Variations</legend>
                                    <div className="product-detail__variation-grid">
                                        {variations.map((variation, index) => {
                                            const label = getVariationLabel(variation, index);
                                            const isSelected = selectedVariation === variation;
                                            const variationPrice = Number(variation.price ?? product.price);
                                            const variationRegularPrice = Number(variation.regular_price ?? product.regular_price);
                                            const variationImage = getVariationImage(variation);
                                            const variationInStock = getVariationStock(variation);
                                            return (
                                                <button
                                                    className={`product-detail__variation-card${isSelected ? " is-selected" : ""}`}
                                                    key={variation.id ?? `${label}-${index}`}
                                                    type="button"
                                                    aria-pressed={isSelected}
                                                    onClick={() => setVariationSelection({ slug, index })}
                                                >
                                                    {variationImage
                                                        ? <img src={variationImage} alt={`${label} variation`} />
                                                        : <span className="product-detail__variation-image-placeholder" aria-hidden="true">Image unavailable</span>}

                                                    <div>
                                                        <div className="product-detail__variation-material">
                                                            Material: <span> {getVariationMaterial(variation) ?? "Not specified"}</span>
                                                        </div>
                                                        <span className="product-detail__variation-price">
                                                            {formatPrice(variationPrice)}
                                                            {variationRegularPrice > variationPrice && (
                                                                <del>{formatPrice(variationRegularPrice)}</del>
                                                            )}
                                                        </span>
                                                        <span className={`product-detail__variation-stock ${variationInStock ? "is-in-stock" : "is-out-of-stock"}`}>
                                                            {variationInStock ? "In stock" : "Out of stock"}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                            )}

                            {variations.length === 0 && colors.length > 0 && (
                                <fieldset className="product-detail__options">
                                    <legend>Color</legend>
                                    <div className="product-detail__choices">
                                        {colors.map((color) => {
                                            const value = typeof color === "string" ? color : color.name;
                                            return (
                                                <button
                                                    className={selectedColor === value ? "is-selected" : ""}
                                                    key={value}
                                                    type="button"
                                                    aria-pressed={selectedColor === value}
                                                    onClick={() => setSelectedColor(value)}
                                                >
                                                    {value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                            )}

                            {variations.length === 0 && sizes.length > 0 && (
                                <label className="product-detail__size">
                                    Size
                                    <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)}>
                                        <option value="">Select size</option>
                                        {sizes.map((size) => {
                                            const value = typeof size === "string" ? size : size.name;
                                            return <option key={value} value={value}>{value}</option>;
                                        })}
                                    </select>
                                </label>
                            )}

                            <div className="product-detail__purchase">
                                <div className="product-detail__quantity" aria-label="Quantity">
                                    <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                                    <span>{quantity}</span>
                                    <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>+</button>
                                </div>

                                <Button materialIcon="shopping_cart" text={isAddingToCart ? "Adding..." : "Add to Cart"} type="button"
                                    disabled={isAddingToCart || !inStock}
                                    onClick={() => handleAddItemsToCart([product], "product")}
                                >
                                </Button>
                                <Button
                                    materialIcon="shopping_bag"
                                    text="Buy Now"
                                    className="common-button--reverse"
                                    disabled={isAddingToCart || !inStock}
                                    onClick={handleProductBuyNow}
                                />

                                {/* <button
                                    type="button"
                                    className="product-detail__add-button"
                                    disabled={isAddingToCart}
                                    onClick={() => handleAddItemsToCart([product], "product")}
                                >
                                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                                </button> */}
                            </div>

                            <div className="safeCheckout-img">
                                <img src={safeCheckoutImg} alt="" />
                            </div>
                            <div className="paymentOption">
                                <img src={paymentOption} alt="" />
                            </div>
                            {renderCartFeedback("product")}

                            {product.description && (
                                <details className="product-detail__description" open>
                                    <summary>Description</summary>
                                    <p>{product.description}</p>
                                </details>
                            )}
                            {getVariationMaterial(displayedProduct) && (
                                <details className="product-detail__description">
                                    <summary>Material &amp; Care</summary>
                                    <p>{getVariationMaterial(displayedProduct)}</p>
                                </details>
                            )}
                            <details className="product-detail__description">
                                <summary>Shipping Policy</summary>
                                <h5 style={{ marginTop: "0", marginBottom: "10px" }}> Shipping & Delivery</h5>

                                <p> We deliver happiness to your doorstep with convenient shipping options across India and internationally.</p>
                                <ul style={{ listStyle: "none", paddingLeft: "0", lineHeight: "31px" }}>
                                    <li><strong> **Free Shipping Across India:** </strong> Enjoy free delivery on all orders above ₹699.</li>
                                    <li> <strong> * **International Shipping:**</strong> We ship worldwide, with an estimated delivery time of 8–10 days.</li>
                                    <li><strong>* **International Customs & Duties:**</strong> Any applicable customs duties, taxes, or statutory charges on international orders are the customer's responsibility.</li>
                                </ul>
                            </details>

                            <details className="product-detail__description">
                                <summary>Return Policy</summary>
                                <h5 style={{ marginTop: "0", marginBottom: "10px" }}> Shipping & Delivery</h5>

                                <p> We deliver happiness to your doorstep with convenient shipping options across India and internationally.</p>
                                <ul style={{ listStyle: "none", paddingLeft: "0", lineHeight: "31px" }}>
                                    <li><strong> **Free Shipping Across India:** </strong> Enjoy free delivery on all orders above ₹699.</li>
                                    <li> <strong> * **International Shipping:**</strong> We ship worldwide, with an estimated delivery time of 8–10 days.</li>
                                    <li><strong>* **International Customs & Duties:**</strong> Any applicable customs duties, taxes, or statutory charges on international orders are the customer's responsibility.</li>
                                </ul>
                            </details>

                        </section>
                    </div>
                </div>
            </div>

            <div className="container">
                {matchingCombos.length > 0 && (
                    <section className="product-bundle" aria-labelledby="product-bundle-title">
                        <div className="product-bundle__header">
                            <h2 id="product-bundle-title">Buy Together &amp; Save</h2>
                            <span className="slideInRight">Live combo offers</span>
                        </div>

                        <div className="product-combo__offers">
                            {matchingCombos.map((combo) => (
                                <article className="product-combo" key={combo.id}>
                                    <div className="product-combo__heading">
                                        <h3>{combo.name}</h3>
                                        <span>Save {Number(combo.savings_percent).toLocaleString("en-IN")}%</span>
                                    </div>

                                    <div className="product-combo__items">
                                        {combo.products.map((item, index) => (
                                            <div className="product-combo__item-wrap" key={item.id}>
                                                <Link className="product-combo__item" to={`/product/${item.slug}`}>
                                                    <img src={getThumbnail(item)} alt={item.name} />
                                                    <h4>{item.name}</h4>
                                                    <p>{formatPrice(item.price)}</p>
                                                </Link>
                                                {index < combo.products.length - 1 && <span className="product-combo__plus" aria-hidden="true">+</span>}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="buy-together">
                                        <div className="product-combo__pricing">
                                            <span>Combo price</span>
                                            <del>{formatPrice(combo.products_total)}</del>
                                            <strong>{formatPrice(combo.combo_price)}</strong>
                                            <span className="product-bundle__saving">You save {formatPrice(combo.discount_amount)}</span>
                                        </div>
                                        <div className="product-combo__actions">
                                            <Button
                                                className="product-combo__add-button"
                                                materialIcon="add_shopping_cart"
                                                text={isAddingToCart ? "Adding..." : "Add to Cart"}
                                                disabled={isAddingToCart}
                                                fullWidth
                                                onClick={() => handleAddComboToCart(combo)}
                                            />
                                            <button
                                                className="secondary-btn"
                                                type="button"
                                                disabled={isAddingToCart}
                                                onClick={() => handleComboBuyNow(combo)}
                                            >
                                                Buy Now
                                                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                    {renderCartFeedback(`combo-${combo.id}`)}
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <div className="container">
                <ProductReviews slug={slug} reviews={reviews} />
            </div>
        </>

    );
}

export default ProductDetail;