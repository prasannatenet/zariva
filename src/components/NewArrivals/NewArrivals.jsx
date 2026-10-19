import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetHomeDataQuery } from "../../store/api/productApi";
import "./NewArrivals.css";

const campaignDuration = 36 * 24 * 60 * 60 + 18 * 60 * 60 + 57 * 60 + 43;

function formatPrice(price) {
    return `₹${Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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
    const { data: homeData, isLoading } = useGetHomeDataQuery();
    const [remainingSeconds, setRemainingSeconds] = useState(campaignDuration);

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, []);

    const countdown = formatTime(remainingSeconds);
    const arrivals = (homeData?.data?.new_arrivals || []).slice(0, 2);

    if (isLoading && arrivals.length === 0) {
        return null;
    }

    if (arrivals.length === 0) {
        return null;
    }

    return (
        <section className="new-arrivals" aria-labelledby="new-arrivals-title">
            <div className="new-arrivals__heading">
                <h2 id="new-arrivals-title">New Arrivals</h2>
                <p>Discover thoughtfully crafted pieces made to celebrate your every day.</p>
            </div>

            <div className="new-arrivals__grid">
                {arrivals.map((product) => {
                    const price = Number(product.price) || 0;
                    const regularPrice = Number(product.regular_price || product.base_price || product.price) || 0;
                    const discount = product.discount_percentage || (regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0);
                    const category = product.category?.name || "Jewellery";
                    const image = product.primary_image || product.images?.[0] || "";
                    const description = product.short_description || product.description || "";
                    const rating = product.rating || "5.0";
                    const reviews = product.reviews_count || product.review_count || 0;
                    const href = `/product/${product.slug}`;

                    return (
                        <article className="new-arrival-card" key={product.id || product.slug}>
                            <Link
                                className="new-arrival-card__image"
                                to={href}
                                aria-label={`Explore ${product.name}`}
                            >
                                <img src={image} alt={product.name} />
                                {discount > 0 && (
                                    <span className="new-arrival-card__discount">{discount}% OFF</span>
                                )}
                            </Link>

                            <div className="new-arrival-card__details">
                                <span className="new-arrival-card__category">{category}</span>
                                <h3>
                                    <Link to={href}>{product.name}</Link>
                                </h3>

                                <div className="new-arrival-card__price">
                                    <strong>{formatPrice(price)}</strong>
                                    {regularPrice > price && (
                                        <del>{formatPrice(regularPrice)}</del>
                                    )}
                                </div>

                                <p className="new-arrival-card__rating">
                                    <span aria-hidden="true">★</span>
                                    <strong>{rating}</strong>
                                    <span>{reviews} Reviews</span>
                                </p>

                                {description && (
                                    <p className="new-arrival-card__description">{description}</p>
                                )}

                                <div className="new-arrival-card__countdown" aria-label="Campaign expiration countdown">
                                    <div className="new-arrival-card__time">
                                        {countdown.map((part, index) => (
                                            <span className="new-arrival-card__time-part" key={`${product.id}-${index}`}>
                                                {part}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="new-arrival-card__countdown-label">Campaign expiration date</span>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default NewArrivals;
