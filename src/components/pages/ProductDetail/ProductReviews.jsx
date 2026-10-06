import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSubmitProductReviewMutation } from "../../../store/api/authApi";
import Button from "../../Button/Button";
import "./ProductReviews.css";

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const getImageUrl = (image) => typeof image === "string"
    ? image
    : image?.url ?? image?.src ?? image?.path;

function ProductReviews({ slug, reviews }) {
    const location = useLocation();
    const [submitReview, { isLoading }] = useSubmitProductReviewMutation();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const reviewList = Array.isArray(reviews?.data) ? reviews.data : [];
    const summary = reviews?.summary ?? {};
    const average = Number(summary.average) || 0;
    const reviewCount = Number(summary.count ?? reviews?.total ?? reviewList.length);

    useEffect(() => () => {
        images.forEach((image) => URL.revokeObjectURL(image.preview));
    }, [images]);

    const handleImageChange = (event) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        const remainingSlots = MAX_IMAGES - images.length;

        if (selectedFiles.length > remainingSlots) {
            setFeedback({ type: "error", message: `You can attach up to ${MAX_IMAGES} images.` });
            event.target.value = "";
            return;
        }

        const invalidFile = selectedFiles.find((file) => !file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE);
        if (invalidFile) {
            setFeedback({ type: "error", message: "Choose image files up to 5 MB each." });
            event.target.value = "";
            return;
        }

        setFeedback(null);
        setImages((current) => [
            ...current,
            ...selectedFiles.map((file) => ({ file, preview: URL.createObjectURL(file) })),
        ]);
        event.target.value = "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setFeedback(null);

        try {
            await submitReview({
                slug,
                rating,
                comment: comment.trim(),
                images: images.map((image) => image.file),
            }).unwrap();
            setComment("");
            setRating(5);
            setImages([]);
            form.reset();
            setFeedback({ type: "success", message: "Your review was submitted." });
        } catch (error) {
            setFeedback({
                type: "error",
                message: error.status === 401
                    ? "Sign in to submit a review."
                    : error.data?.message || "Your review could not be submitted. Please try again.",
                requiresLogin: error.status === 401,
            });
        }
    };

    return (
        <section className="product-reviews" id="product-reviews" aria-labelledby="product-reviews-title">
            <div className="product-reviews__heading">
                <div>
                    <p className="product-reviews__eyebrow">CUSTOMER NOTES</p>
                    <h2 id="product-reviews-title">Reviews &amp; Ratings</h2>
                </div>
                <div className="product-reviews__summary" aria-label={`${average.toFixed(1)} out of 5 from ${reviewCount} reviews`}>
                    <span className="product-reviews__summary-stars material-symbols-outlined" aria-hidden="true">star</span>
                    <strong>{average.toFixed(1)}</strong>
                    <span>{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
                </div>
            </div>

            <div className="product-reviews__layout">
                <div className="product-reviews__list">
                    {reviewList.length === 0 ? (
                        <p className="product-reviews__empty">No reviews yet. Be the first to share your experience.</p>
                    ) : reviewList.map((review) => {
                        const createdAt = review.created_at ? new Date(review.created_at) : null;
                        const dateLabel = createdAt && !Number.isNaN(createdAt.getTime())
                            ? createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : "";

                        return (
                            <article className="product-review" key={review.id}>
                                <div className="product-review__author">
                                    <span className="product-review__initials" aria-hidden="true">
                                        {review.author?.initials ?? review.author?.name?.slice(0, 1) ?? "Z"}
                                    </span>
                                    <div>
                                        <strong>{review.author?.name ?? "Customer"}</strong>
                                        {dateLabel && <time dateTime={review.created_at}>{dateLabel}</time>}
                                    </div>
                                </div>
                                <div className="product-review__stars" aria-label={`${review.rating} out of 5 stars`}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`material-symbols-outlined ${star <= Number(review.rating) ? "is-filled" : ""}`}
                                            aria-hidden="true"
                                        >star</span>
                                    ))}
                                </div>
                                {review.comment && <p className="product-review__comment">{review.comment}</p>}
                                {Array.isArray(review.images) && review.images.length > 0 && (
                                    <div className="product-review__images" aria-label="Customer review photos">
                                        {review.images.map((image, index) => {
                                            const imageUrl = getImageUrl(image);
                                            return imageUrl && (
                                                <a href={imageUrl} target="_blank" rel="noreferrer" key={image.id ?? imageUrl}>
                                                    <img src={imageUrl} alt={`Customer review photo ${index + 1}`} loading="lazy" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>

                <form className="product-review-form" onSubmit={handleSubmit}>
                    <h3>Write a review</h3>
                    <fieldset className="product-review-form__rating">
                        <legend>Your rating</legend>
                        <div>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                                    aria-pressed={rating === star}
                                    onClick={() => setRating(star)}
                                >
                                    <span className={`material-symbols-outlined ${star <= rating ? "is-filled" : ""}`} aria-hidden="true">star</span>
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    <label className="product-review-form__comment">
                        Your experience
                        <textarea
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="What did you think of this piece?"
                            rows="4"
                            maxLength="2000"
                            required
                        />
                    </label>
                    <div className="product-review-form__upload">
                        <label htmlFor={`review-images-${slug}`}>
                            <span className="material-symbols-outlined" aria-hidden="true">add_a_photo</span>
                            Add photos
                        </label>
                        <input
                            id={`review-images-${slug}`}
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={images.length >= MAX_IMAGES}
                            onChange={handleImageChange}
                        />
                        <span>{images.length}/{MAX_IMAGES} images · 5 MB max each</span>
                    </div>
                    {images.length > 0 && (
                        <div className="product-review-form__previews">
                            {images.map((image, index) => (
                                <div key={`${image.file.name}-${image.file.lastModified}`}>
                                    <img src={image.preview} alt={`Selected review photo ${index + 1}`} />
                                    <button
                                        type="button"
                                        aria-label={`Remove photo ${index + 1}`}
                                        onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                                    >
                                        <span className="material-symbols-outlined" aria-hidden="true">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {feedback && (
                        <p className={`product-review-form__feedback is-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
                            {feedback.message}{" "}
                            {feedback.requiresLogin && (
                                <Link to="/login" state={{ backgroundLocation: location }}>
                                    Sign in
                                </Link>
                            )}
                        </p>
                    )}
                    <Button
                        text={isLoading ? "Submitting..." : "Submit review"}
                        type="submit"
                        materialIcon="send"
                        fullWidth
                        disabled={isLoading || !comment.trim()}
                    />
                </form>
            </div>
        </section>
    );
}

export default ProductReviews;