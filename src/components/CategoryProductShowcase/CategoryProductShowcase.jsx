import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAddToCartMutation } from "../../store/api/authApi";
import { addLocalCartItem } from "../../store/slices/cartSlice";
import Button from "../Button/Button";
import "./CategoryProductShowcase.css";

function CategoryProductShowcase({ products = [], categoryName = "Jewellery" }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const railRef = useRef(null);
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [addToCart, { isLoading }] = useAddToCartMutation();
    const featuredIndex = selectedIndex ?? Math.max(0, products.findIndex((product) => product.in_stock));

    useEffect(() => {
        const rail = railRef.current;
        if (!rail || products.length === 0) return;

        const selectedCard = rail.querySelector(`[data-product-index="${featuredIndex}"]`);
        if (selectedCard) {
            rail.scrollLeft += selectedCard.getBoundingClientRect().left - rail.getBoundingClientRect().left;
        }

    }, [featuredIndex, products]);

    if (products.length === 0) return null;

    const selectedProduct = products[featuredIndex] || products[0];
    const image = selectedProduct.primary_image || selectedProduct.images?.[0];
    const price = Number(selectedProduct.price);
    const regularPrice = Number(selectedProduct.regular_price);

    const handleAddToCart = async () => {
        setFeedback(null);

        if (!isAuthenticated) {
            dispatch(addLocalCartItem({ product: selectedProduct, quantity: 1 }));
            setFeedback({ type: "success", message: "Added to your cart." });
            return;
        }

        try {
            await addToCart({ product_id: selectedProduct.id, quantity: 1 }).unwrap();
            setFeedback({ type: "success", message: "Added to your cart." });
        } catch (error) {
            setFeedback({
                type: "error",
                message: error.status === 401
                    ? "Please sign in to add this item to your cart."
                    : error.data?.message || "Could not add this item. Please try again.",
                requiresLogin: error.status === 401,
            });
        }
    };

    const scrollRail = (direction) => {
        const nextIndex = (featuredIndex + direction + products.length) % products.length;
        setSelectedIndex(nextIndex);
    };

    return (
        <section className="category-showcase" aria-label={`${categoryName} collection`}>
            <div className="category-showcase__feature">
                <div className="category-showcase__image">
                    {image && <img src={image} alt={selectedProduct.name} />}
                </div>

                <div className="category-showcase__details">
                    <p className="category-showcase__eyebrow">THE {categoryName.toUpperCase()} EDIT</p>
                    <h2>{selectedProduct.name}</h2>
                    <p className="category-showcase__description">
                        A timeless piece, selected for your everyday and special moments.
                    </p>

                    <div className="category-showcase__price">
                        <strong>₹{price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                        {regularPrice > price && (
                            <del>₹{regularPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</del>
                        )}
                    </div>

                    <Button
                        className="category-showcase__add-button"
                        text={isLoading ? "Adding..." : selectedProduct.in_stock ? "Add to Cart" : "Out of stock"}
                        materialIcon="add_shopping_cart"
                        onClick={handleAddToCart}
                        disabled={isLoading || !selectedProduct.in_stock}
                    />

                    {feedback && (
                        <p className={`category-showcase__feedback is-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
                            {feedback.message}{" "}
                            {feedback.requiresLogin && <Link to="/login">Sign in</Link>}
                        </p>
                    )}
                </div>
            </div>

            <div
                className="category-showcase__rail"
                aria-label={`${categoryName} products`}
                ref={railRef}
            >
                <div className="category-showcase__track">
                    {products.map((product, index) => {
                        const productImage = product.primary_image || product.images?.[0];
                        const isSelected = index === featuredIndex;

                        return (
                            <button
                                className={`category-showcase__product ${isSelected ? "is-selected" : ""}`}
                                data-product-index={index}
                                key={product.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setSelectedIndex(index)}
                            >
                                <span className="category-showcase__product-image">
                                    {productImage && <img src={productImage} alt="" />}
                                </span>
                                <span className="category-showcase__product-info">
                                    <span>{product.name}</span>
                                    <strong>₹{Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="category-showcase__controls" aria-label={`${categoryName} product navigation`}>
                <button
                    className="category-showcase__arrow"
                    type="button"
                    aria-label="Previous products"
                    title="Previous products"
                    disabled={products.length < 2}
                    onClick={() => scrollRail(-1)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                </button>
                <button
                    className="category-showcase__arrow"
                    type="button"
                    aria-label="Next products"
                    title="Next products"
                    disabled={products.length < 2}
                    onClick={() => scrollRail(1)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </button>
            </div>
        </section>
    );
}

export default CategoryProductShowcase;