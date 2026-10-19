import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../../store/api/productApi";
import Button from "../Button/Button";
import "./VideoGallery.css";

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

function VideoGallery({ products: propProducts }) {
    const { data: apiData } = useGetProductsQuery(
        { per_page: 60 },
        { skip: Boolean(propProducts && propProducts.length > 0) }
    );
    const rawProducts = (propProducts && propProducts.length > 0) ? propProducts : (apiData?.data || []);

    const videoProducts = [];
    rawProducts.forEach((product) => {
        const videos = Array.isArray(product.videos) ? product.videos : [];
        videos.forEach((video, videoIndex) => {
            const videoUrl = typeof video === "string" ? video : (video?.download_url || video?.url);
            if (videoUrl) {
                videoProducts.push({
                    id: product.id,
                    videoId: (typeof video === "object" && video?.id) ? video.id : `video-${product.id}-${videoIndex}`,
                    name: product.name,
                    slug: product.slug,
                    category: product.category?.name || "Jewellery",
                    price: Number(product.price) || 0,
                    originalPrice: Number(product.regular_price || product.base_price || product.price) || 0,
                    image: product.primary_image || product.images?.[0] || "",
                    videoUrl,
                    views: product.views || (100 + ((Number(product.id || 1) * 73) % 900)),
                });
            }
        });
    });

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const railRef = useRef(null);
    const navigate = useNavigate();

    const validSelectedIndex = selectedIndex !== null && selectedIndex < videoProducts.length
        ? selectedIndex
        : null;
    const selectedProduct = validSelectedIndex === null ? null : videoProducts[validSelectedIndex];

    useEffect(() => {
        if (selectedProduct === null) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const closeOnEscape = (event) => {
            if (event.key === "Escape") setSelectedIndex(null);
            if (event.key === "ArrowLeft" && videoProducts.length > 1) {
                setSelectedIndex((index) => (index - 1 + videoProducts.length) % videoProducts.length);
            }
            if (event.key === "ArrowRight" && videoProducts.length > 1) {
                setSelectedIndex((index) => (index + 1) % videoProducts.length);
            }
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [selectedProduct, videoProducts.length]);

    if (videoProducts.length === 0) {
        return null;
    }

    const moveSlider = (direction) => {
        if (videoProducts.length <= 1) return;
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

    const handleBuyNow = (product) => {
        const target = product || selectedProduct;
        if (!target) return;
        if (target.slug) {
            navigate(`/product/${target.slug}`);
        } else {
            navigate("/");
        }
        setSelectedIndex(null);
    };

    const sliderOffsets = videoProducts.length >= 5
        ? [-2, -1, 0, 1, 2]
        : videoProducts.length >= 3
            ? [-1, 0, 1]
            : [0];

    return (
        <section className="video-gallery" aria-labelledby="video-gallery-title">
            <div className="video-gallery__heading">
                <h2 id="video-gallery-title">Trending Looks</h2>
            </div>

            <div
                className={`video-gallery__rail${videoProducts.length === 1 ? " is-single" : ""}${videoProducts.length <= 2 ? " is-few" : ""}`}
                ref={railRef}
                aria-label="Jewellery videos"
            >
                {videoProducts.map((product, index) => (
                    <button
                        className="video-gallery__card"
                        type="button"
                        key={`${product.videoId || product.id}-${index}`}
                        onClick={() => {
                            setSelectedIndex(index);
                            setIsMuted(true);
                        }}
                        aria-label={`Watch video and details for ${product.name}`}
                    >
                        <span className="video-gallery__visual">
                            {/* <span className="video-gallery__views" aria-label={`${product.views} views`}>
                                <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
                                {product.views}
                            </span> */}
                            <video
                                className="video-gallery__preview"
                                src={product.videoUrl}
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
                                src={product.image}
                                alt=""
                                aria-hidden="true"
                            />
                            <span className="video-gallery__product-info">
                                <span className="video-gallery__product-name">{product.name}</span>
                                <span className="video-gallery__product-prices">
                                    <strong>{formatPrice(product.price)}</strong>
                                    {product.originalPrice > product.price && (
                                        <del>{formatPrice(product.originalPrice)}</del>
                                    )}
                                </span>
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {videoProducts.length > 1 && (
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
            )}

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
                        {videoProducts.length > 1 && (
                            <Button
                                text=""
                                materialIcon="chevron_left"
                                ariaLabel="Previous video"
                                onClick={() => moveSlider(-1)}
                                className="video-gallery__modal-arrow video-gallery__modal-arrow--previous"
                            />
                        )}
                        <div className="video-gallery__slider">
                            {sliderOffsets.map((offset) => {
                                const slideIndex = (selectedIndex + offset + videoProducts.length) % videoProducts.length;
                                const slideProduct = videoProducts[slideIndex];
                                const isActive = offset === 0;

                                return (
                                    <article
                                        className={`video-gallery__slide${isActive ? " is-active" : ""}${Math.abs(offset) === 1 ? " is-near" : ""}${Math.abs(offset) === 2 ? " is-far" : ""}${offset < 0 ? " is-left" : ""}`}
                                        key={`${slideProduct.videoId || slideProduct.id}-${offset}`}
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
                                            src={slideProduct.videoUrl}
                                            muted={isMuted || !isActive}
                                            autoPlay
                                            loop
                                            playsInline
                                            controlsList="nodownload noplaybackrate"
                                            disablePictureInPicture
                                            onContextMenu={(event) => event.preventDefault()}
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
                                                        src={slideProduct.image}
                                                        alt=""
                                                        aria-hidden="true"
                                                    />
                                                    <div className="video-gallery__modal-product-info">
                                                        <strong>{slideProduct.name}</strong>
                                                        <span>
                                                            {formatPrice(slideProduct.price)}
                                                            {slideProduct.originalPrice > slideProduct.price && (
                                                                <del>{formatPrice(slideProduct.originalPrice)}</del>
                                                            )}
                                                        </span>
                                                        <Button
                                                            text="Shop Now"
                                                            onClick={() => handleBuyNow(slideProduct)}
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
                        {videoProducts.length > 1 && (
                            <Button
                                text=""
                                materialIcon="chevron_right"
                                ariaLabel="Next video"
                                onClick={() => moveSlider(1)}
                                className="video-gallery__modal-arrow video-gallery__modal-arrow--next"
                            />
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}

export default VideoGallery;
