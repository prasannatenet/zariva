import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import solitaireRingImage from "../../assets/images/brading-image.png";
import statementRingImage from "../../assets/images/brading-image2.png";
import "./NewArrivals.css";

const campaignDuration = 36 * 24 * 60 * 60 + 18 * 60 * 60 + 57 * 60 + 43;

const arrivals = [
    {
        category: "Rings",
        name: "Classic Diamond Solitaire Ring",
        price: 24999,
        originalPrice: 32999,
        discount: 24,
        rating: "4.9",
        reviews: 12,
        description: "A timeless solitaire, crafted to bring a little brilliance to every special moment.",
        image: solitaireRingImage,
        imageAlt: "Diamond solitaire ring",
        href: "/rings",
    },
    {
        category: "Rings",
        name: "Signature Brilliant Cut Ring",
        price: 18999,
        originalPrice: 21999,
        discount: 14,
        rating: "4.8",
        reviews: 9,
        description: "An elegant statement design made to add a touch of sparkle to your everyday.",
        image: statementRingImage,
        imageAlt: "Brilliant cut statement ring",
        href: "/rings",
    },
];

function formatPrice(price) {
    return `₹${price.toLocaleString("en-IN")}`;
}

function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [days, hours, minutes, remainingSeconds]
        .map((part) => String(part).padStart(2, "0"));
}

function NewArrivals() {
    const [remainingSeconds, setRemainingSeconds] = useState(campaignDuration);

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, []);

    const countdown = formatTime(remainingSeconds);

    return (
        <section className="new-arrivals" aria-labelledby="new-arrivals-title">
            <div className="new-arrivals__heading">
                <h2 id="new-arrivals-title">New Arrivals</h2>
                <p>Discover thoughtfully crafted pieces made to celebrate your every day.</p>
            </div>

            <div className="new-arrivals__grid">
                {arrivals.map((product) => (
                    <article className="new-arrival-card" key={product.name}>
                        <Link
                            className="new-arrival-card__image"
                            to={product.href}
                            aria-label={`Explore ${product.name}`}
                        >
                            <img src={product.image} alt={product.imageAlt} />
                            <span className="new-arrival-card__discount">{product.discount}% OFF</span>
                        </Link>

                        <div className="new-arrival-card__details">
                            <span className="new-arrival-card__category">{product.category}</span>
                            <h3>
                                <Link to={product.href}>{product.name}</Link>
                            </h3>

                            <div className="new-arrival-card__price">
                                <strong>{formatPrice(product.price)}</strong>
                                <del>{formatPrice(product.originalPrice)}</del>
                            </div>

                            <p className="new-arrival-card__rating">
                                <span aria-hidden="true">★</span>
                                <strong>{product.rating}</strong>
                                <span>{product.reviews} Reviews</span>
                            </p>

                            <p className="new-arrival-card__description">{product.description}</p>

                            <div className="new-arrival-card__countdown" aria-label="Campaign expiration countdown">
                                <div className="new-arrival-card__time">
                                    {countdown.map((part, index) => (
                                        <span className="new-arrival-card__time-part" key={`${product.name}-${index}`}>
                                            {part}
                                        </span>
                                    ))}
                                </div>
                                <span className="new-arrival-card__countdown-label">Campaign expiration date</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default NewArrivals;
