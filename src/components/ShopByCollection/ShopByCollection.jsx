import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard from "../ProductCard/ProductCard";
import SectionTitle from "../SectionTitle/SectionTitle";
import "swiper/css";
import "./ShopByCollection.css";

function ShopByCollection({ products = [], isLoading = false, isError = false }) {
    const swiperRef = useRef(null);
    const [sliderState, setSliderState] = useState({ isBeginning: true, isEnd: true });

    const updateSliderState = (swiper) => {
        setSliderState({
            isBeginning: swiper.isBeginning,
            isEnd: swiper.isEnd,
        });
    };

    return (
        <section className="shop-collection">
            <div className="container">
                <SectionTitle title="Shop By Collection" className="shop-collection__title" />

                {isLoading && <p className="shop-collection__message">Loading products...</p>}
                {isError && <p className="shop-collection__message" role="alert">Unable to load products.</p>}

                {!isLoading && !isError && products.length > 0 && (
                    <div className="shop-collection__slider">
                        <button
                            className="shop-collection__arrow shop-collection__arrow--prev"
                            type="button"
                            aria-label="Previous products"
                            disabled={sliderState.isBeginning}
                            onClick={() => swiperRef.current?.slidePrev()}
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                        </button>

                        <Swiper
                            modules={[Navigation]}
                            className="shop-collection__swiper"
                            spaceBetween={18}
                            slidesPerView={1.2}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                                updateSliderState(swiper);
                            }}
                            onSlideChange={updateSliderState}
                            onResize={updateSliderState}
                            breakpoints={{
                                576: { slidesPerView: 2, spaceBetween: 16 },
                                768: { slidesPerView: 3, spaceBetween: 18 },
                                1024: { slidesPerView: 4, spaceBetween: 20 },
                            }}
                        >
                            {products.map((product) => (
                                <SwiperSlide key={product.id}>
                                    <ProductCard product={product} />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <button
                            className="shop-collection__arrow shop-collection__arrow--next"
                            type="button"
                            aria-label="Next products"
                            disabled={sliderState.isEnd}
                            onClick={() => swiperRef.current?.slideNext()}
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ShopByCollection;