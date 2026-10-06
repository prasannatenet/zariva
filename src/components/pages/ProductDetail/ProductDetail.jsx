import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetCombosQuery, useGetProductQuery } from "../../../store/api/productApi";
import { useAddToCartMutation } from "../../../store/api/authApi";
import "./ProductDetail.css";
import Button from "../../../components/Button/Button";
import ProductReviews from "./ProductReviews";

import safeCheckoutImg from "../../../assets/images/safe-checkout.png"

function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetProductQuery(slug);
    const { data: combosData } = useGetCombosQuery();
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const [expandedImageSlug, setExpandedImageSlug] = useState(null);
    const [variationSelection, setVariationSelection] = useState({ slug, index: 0 });
    const selectedVariationIndex = variationSelection.slug === slug ? variationSelection.index : 0;
    const [zoomPreview, setZoomPreview] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [cartFeedback, setCartFeedback] = useState(null);

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
    const images = productImages
        .map((image) => typeof image === "string" ? image : image?.url ?? image?.src)
        .filter(Boolean);
    const visibleImages = expandedImageSlug === slug ? images : images.slice(0, 4);
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const rating = Number(reviews.summary?.average ?? product.rating) || 0;
    const reviewCount = Number(reviews.summary?.count ?? product.reviews_count ?? product.review_count ?? 0);
    const price = Number(displayedProduct.price ?? product.price);
    const regularPrice = Number(displayedProduct.regular_price ?? product.regular_price);
    const discount = regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;
    const inStock = displayedProduct.in_stock
        ?? (displayedProduct.stock_quantity != null
            ? Number(displayedProduct.stock_quantity) > 0
            : product.in_stock ?? Number(product.stock_quantity) > 0);
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
                        <section className="product-detail__gallery" aria-label="Product images">
                            {visibleImages.length > 0 ? (
                                <div className="product-detail__image-grid">
                                    {visibleImages.map((image, index) => (
                                        <div
                                            className="product-detail__image-tile"
                                            key={`${image}-${index}`}
                                            data-image={image}
                                            onMouseMove={handleImageZoom}
                                            onMouseLeave={() => setZoomPreview(null)}
                                        >
                                            <img src={image} alt={`${product.name} view ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="product-detail__image-placeholder">Image unavailable</div>
                            )}
                            {zoomPreview && (
                                <div className="product-detail__zoom-preview" aria-hidden="true">
                                    <img
                                        src={zoomPreview.src}
                                        alt=""
                                        style={{ transformOrigin: `${zoomPreview.x}% ${zoomPreview.y}%` }}
                                    />
                                </div>
                            )}
                            {images.length > visibleImages.length && (
                                <button
                                    className="product-detail__load-more"
                                    type="button"
                                    onClick={() => setExpandedImageSlug(slug)}
                                >
                                    Load more images
                                </button>
                            )}
                        </section>

                        <section className="product-detail__info">
                            {product.sku && <p className="product-detail__sku">SKU: {product.sku}</p>}
                            <h1>{product.name}</h1>

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

                            <p className={`product-detail__stock ${inStock ? "is-in-stock" : "is-out-of-stock"}`}>
                                {inStock ? "In stock" : "Out of stock"}
                            </p>

                            <p className="product-detail__price">
                                ₹{Number.isFinite(price) ? price.toLocaleString("en-IN") : "-"}
                                {regularPrice > price && <span className="regualrPrice">₹{regularPrice.toLocaleString("en-IN")}</span>}
                                {discount > 0 && <span className="discountValue">{discount}% OFF</span>}
                            </p>

                            <p className="product-detail__delivery">
                                <span className="material-symbols-outlined">delivery_truck_speed</span>
                                Delivery in 3-5 business days
                            </p>

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

                                <Button materialIcon="add_shopping_cart" text={isAddingToCart ? "Adding..." : "Add to Cart"} type="button"
                                    disabled={isAddingToCart || !inStock}
                                    onClick={() => handleAddItemsToCart([product], "product")}
                                >
                                </Button>

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
                                <span>Guarantee safe checkout</span>
                                <img src={safeCheckoutImg} alt="" />
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