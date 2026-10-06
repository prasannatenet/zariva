import { useState } from "react";
import { Link } from "react-router-dom";
import "./CardSpread.css";
import SectionTitle from "../SectionTitle/SectionTitle";
import Button from "../Button/Button";

function CardSpread({ products = [], categoryName = "Jewellery" }) {
    const [activeIndex, setActiveIndex] = useState(null);

    if (products.length === 0) return null;

    return (
        <section className="card-spread mt-100" aria-labelledby="card-spread-title">
            <div className="card-spread__heading">
                <span className="card-spread__eyebrow">EXPLORE THE COLLECTION</span>
                <SectionTitle className="spread-card-heading" title={`${categoryName} Collection`} iconColor="#B8A98F" dividerColor="#B8A98F" subtitle={`A considered edit of pieces from our ${categoryName} collection.`}>
                </SectionTitle>
            </div>

            <div
                className={`card-spread__stage ${activeIndex !== null ? "has-active-card" : ""}`}
                onMouseLeave={() => setActiveIndex(null)}
                onFocusCapture={(event) => {
                    const card = event.target.closest("[data-card-index]");
                    if (card) setActiveIndex(Number(card.dataset.cardIndex));
                }}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null);
                }}
            >
                <div className="card-spread__deck">
                    {products.map((product, index) => {
                        const offset = index - (products.length - 1) / 2;
                        const image = product.primary_image || product.images?.[0];

                        return (
                            <Link
                                className={`card-spread__card ${activeIndex === index ? "is-active" : ""}`}
                                data-card-index={index}
                                key={product.id}
                                to={`/product/${product.slug}`}
                                style={{
                                    left: `${50 + offset * 8}%`,
                                    zIndex: activeIndex === index ? products.length + 1 : index + 1,
                                    "--card-angle": `${offset * 8}deg`,
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <div className="card-spread__image-wrap">
                                    {image && <img src={image} alt={product.name} />}
                                </div>
                                <div className="card-spread__caption">
                                    <span>{product.category?.name || "Zariva Jewellery"}</span>
                                    <h3>{product.name}</h3>
                                    <p>₹{Number(product.price).toLocaleString("en-IN")}</p>
                                </div>
                            </Link>
                        );
                    })}

                </div>
            </div>
                <div className="d-flex align-items-center justify-center mb-30">
                    <Button
                        text="Explore Collection"
                        materialIcon="arrow_outward"
                    />
                </div>
        </section>
    );
}

export default CardSpread;