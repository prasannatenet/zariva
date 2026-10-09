import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import firstVideo from "../../assets/images/371403_medium.mp4";
import secondVideo from "../../assets/images/316570_medium.mp4";
import pendantImage from "../../assets/images/hero-pendent.png";
import ringImage from "../../assets/images/hero-ring.png";
import "./VideoGallery.css";

const videoClips = [firstVideo, secondVideo];
const productImages = [pendantImage, ringImage];

const videoProducts = [
    { name: "Everyday Elegance Pendant", category: "Pendants", rating: "4.8", reviews: 24, price: 2499, originalPrice: 3299, views: 45 },
    { name: "Timeless Gold Chain", category: "Chains", rating: "4.9", reviews: 18, price: 3299, originalPrice: 4199, views: 384 },
    { name: "Classic Diamond Ring", category: "Rings", rating: "4.7", reviews: 31, price: 4999, originalPrice: 6299, views: 129 },
    { name: "Graceful Bracelet", category: "Bracelets", rating: "4.8", reviews: 16, price: 2999, originalPrice: 3999, views: 100 },
    { name: "Statement Pendant Set", category: "Pendants", rating: "4.9", reviews: 21, price: 3799, originalPrice: 4799, views: 718 },
    { name: "Everyday Gold Chain", category: "Chains", rating: "4.6", reviews: 12, price: 2799, originalPrice: 3499, views: 947 },
    { name: "Signature Solitaire Ring", category: "Rings", rating: "5.0", reviews: 9, price: 5499, originalPrice: 6999, views: 216 },
    { name: "Signature Solitaire Ring", category: "Rings", rating: "5.0", reviews: 9, price: 5499, originalPrice: 6999, views: 183 },
    { name: "Signature Solitaire Ring", category: "Rings", rating: "5.0", reviews: 9, price: 5499, originalPrice: 6999, views: 325 },
    { name: "Signature Solitaire Ring", category: "Rings", rating: "5.0", reviews: 9, price: 5499, originalPrice: 6999, views: 468 },
];

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

function VideoGallery() {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const railRef = useRef(null);
    const navigate = useNavigate();
    const selectedProduct = selectedIndex === null ? null : videoProducts[selectedIndex];

    useEffect(() => {
        if (selectedIndex === null) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const closeOnEscape = (event) => {
            if (event.key === "Escape") setSelectedIndex(null);
            if (event.key === "ArrowLeft") {
                setSelectedIndex((index) => (index - 1 + videoProducts.length) % videoProducts.length);
            }
            if (event.key === "ArrowRight") {
                setSelectedIndex((index) => (index + 1) % videoProducts.length);
            }
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [selectedIndex]);

    const moveSlider = (direction) => {
        setSelectedIndex((index) => (index + direction + videoProducts.length) % videoProducts.length);
    };

    const scrollRail = (direction) => {
        if (!railRef.current) return;
        const card = railRef.current.querySelector(".video-gallery__card");
        const gap = Number.parseFloat(getComputedStyle(railRef.current).columnGap) || 0;
        railRef.current.scrollBy({
            left: direction * ((card?.getBoundingClientRect().width || railRef.current.clientWidth) + gap),
            behavior: "smooth",
        });
    };

    const handleBuyNow = () => {
        const categoryPaths = {
            Bracelets: "/bracelets",
            Chains: "/chains",
            Pendants: "/pendants",
            Rings: "/rings",
        };
        navigate(categoryPaths[selectedProduct.category] || "/");
        setSelectedIndex(null);
    };

    return (
        <section className="video-gallery" aria-labelledby="video-gallery-title">
            <div className="video-gallery__heading">
                <h2 id="video-gallery-title">Trending Looks</h2>
            </div>

            <div className="video-gallery__rail" ref={railRef} aria-label="Jewellery videos">
                {videoProducts.map((product, index) => (
                    <button
                        className="video-gallery__card"
                        type="button"
                        key={`${product.name}-${index}`}
                        onClick={() => {
                            setSelectedIndex(index);
                            setIsMuted(true);
                        }}
                        aria-label={`Watch video and details for ${product.name}`}
                    >
                        <span className="video-gallery__visual">
                            <span className="video-gallery__views" aria-label={`${product.views} views`}>
                                <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
                                {product.views}
                            </span>
                            <video
                                className="video-gallery__preview"
                                src={videoClips[index % videoClips.length]}
                                muted
                                loop
                                autoPlay
                                playsInline
                                preload="metadata"
                                aria-hidden="true"
                            />
                            <span className="video-gallery__play" aria-hidden="true">
                                <span className="material-symbols-outlined">play_arrow</span>
                            </span>
                        </span>
                        <span className="video-gallery__product-card">
                            <img
                                className="video-gallery__product-image"
                                src={productImages[index % productImages.length]}
                                alt=""
                                aria-hidden="true"
                            />
                            <span className="video-gallery__product-info">
                                <span className="video-gallery__product-name">{product.name}</span>
                                <span className="video-gallery__product-prices">
                                    <strong>{formatPrice(product.price)}</strong>
                                    <del>{formatPrice(product.originalPrice)}</del>
                                </span>
                            </span>
                        </span>
                    </button>
                ))}
            </div>
            <div className="video-gallery__controls" aria-label="Video gallery navigation">
                <Button
                    text=""
                    materialIcon="arrow_back"
                    ariaLabel="Scroll videos left"
                    onClick={() => scrollRail(-1)}
                    className="video-gallery__control-button"
                />
                <Button
                    text=""
                    materialIcon="arrow_forward"
                    ariaLabel="Scroll videos right"
                    onClick={() => scrollRail(1)}
                    className="video-gallery__control-button"
                />
            </div>

            {selectedProduct && (
                <div
                    className="video-gallery__modal-backdrop"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) setSelectedIndex(null);
                    }}
                >
                    <section
                        className="video-gallery__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="video-gallery-modal-title"
                    >
                        <h2 className="video-gallery__modal-title" id="video-gallery-modal-title">
                            Trending video: {selectedProduct.name}
                        </h2>
                        <Button
                            text=""
                            materialIcon="chevron_left"
                            ariaLabel="Previous video"
                            onClick={() => moveSlider(-1)}
                            className="video-gallery__modal-arrow video-gallery__modal-arrow--previous"
                        />
                        <div className="video-gallery__slider">
                            {[-2, -1, 0, 1, 2].map((offset) => {
                                const slideIndex = (selectedIndex + offset + videoProducts.length) % videoProducts.length;
                                const slideProduct = videoProducts[slideIndex];
                                const isActive = offset === 0;

                                return (
                                    <article
                                        className={`video-gallery__slide${isActive ? " is-active" : ""}${Math.abs(offset) === 1 ? " is-near" : ""}${Math.abs(offset) === 2 ? " is-far" : ""}${offset < 0 ? " is-left" : ""}`}
                                        key={slideIndex}
                                        style={{
                                            left: `calc(50% + ${offset * 20}rem)`,
                                            zIndex: 5 - Math.abs(offset),
                                        }}
                                        aria-label={`${slideProduct.name}${isActive ? "" : ", select video"}`}
                                        role={isActive ? undefined : "button"}
                                        tabIndex={isActive ? undefined : 0}
                                        onClick={() => {
                                            if (!isActive) setSelectedIndex(slideIndex);
                                        }}
                                        onKeyDown={(event) => {
                                            if (!isActive && (event.key === "Enter" || event.key === " ")) {
                                                event.preventDefault();
                                                setSelectedIndex(slideIndex);
                                            }
                                        }}
                                    >
                                        <video
                                            className="video-gallery__modal-video"
                                            src={videoClips[slideIndex % videoClips.length]}
                                            muted={isMuted || !isActive}
                                            autoPlay
                                            loop
                                            playsInline
                                            preload={isActive ? "auto" : "metadata"}
                                        />
                                        {isActive && (
                                            <>
                                                <div className="video-gallery__modal-actions">
                                                    <Button
                                                        text=""
                                                        materialIcon={isMuted ? "volume_off" : "volume_up"}
                                                        ariaLabel={isMuted ? "Unmute video" : "Mute video"}
                                                        onClick={() => setIsMuted((muted) => !muted)}
                                                        className="video-gallery__modal-action-button"
                                                    />
                                                    <Button
                                                        text=""
                                                        materialIcon="close"
                                                        ariaLabel="Close video slider"
                                                        onClick={() => setSelectedIndex(null)}
                                                        className="video-gallery__modal-action-button"
                                                    />
                                                </div>
                                                <div className="video-gallery__modal-product">
                                                    <img
                                                        src={productImages[slideIndex % productImages.length]}
                                                        alt=""
                                                        aria-hidden="true"
                                                    />
                                                    <div className="video-gallery__modal-product-info">
                                                        <strong>{slideProduct.name}</strong>
                                                        <span>
                                                            {formatPrice(slideProduct.price)}
                                                            <del>{formatPrice(slideProduct.originalPrice)}</del>
                                                        </span>
                                                        <Button
                                                            text="Shop Now"
                                                            onClick={handleBuyNow}
                                                            className="video-gallery__shop-button"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                        <Button
                            text=""
                            materialIcon="chevron_right"
                            ariaLabel="Next video"
                            onClick={() => moveSlider(1)}
                            className="video-gallery__modal-arrow video-gallery__modal-arrow--next"
                        />
                    </section>
                </div>
            )}
        </section>
    );
}

export default VideoGallery;
