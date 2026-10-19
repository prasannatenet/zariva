import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./Hero.css";
import { useGetSlidersQuery } from "../../store/api/productApi";

import heroRing from "../../assets/images/BANNER_01.png";
import heroPendant from "../../assets/images/BANNER_02.png";
import heroBracelet from "../../assets/images/BANNER_03.png";

const fallbackSlides = [
    { id: "local-1", image: heroRing, title: null, subheading: null, button_text: null, button_link: null },
    { id: "local-2", image: heroPendant, title: null, subheading: null, button_text: null, button_link: null },
    { id: "local-3", image: heroBracelet, title: null, subheading: null, button_text: null, button_link: null },
];

function Hero() {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { data: slidersData } = useGetSlidersQuery();
    const apiSlides = Array.isArray(slidersData?.data) && slidersData.data.length > 0
        ? slidersData.data.map((s) => ({
            id: s.id,
            image: s.image,
            title: s.title || null,
            subheading: s.subheading || null,
            button_text: s.button_text || null,
            button_link: s.button_link || null,
        }))
        : null;

    const slides = apiSlides ?? fallbackSlides;

    return (
        <section className="hero">
            <Swiper
                modules={[Autoplay]}
                className="hero__swiper"
                slidesPerView={1}
                spaceBetween={0}
                loop={slides.length > 1}
                speed={800}
                autoplay={{
                    delay: 10000,
                    disableOnInteraction: false,
                }}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    setActiveIndex(swiper.realIndex % slides.length);
                }}
                onSlideChange={(swiper) => {
                    setActiveIndex(swiper.realIndex % slides.length);
                }}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <img
                            src={slide.image}
                            alt={slide.title || "Banner"}
                            className="hero-slide__image"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        className="hero__arrow hero__arrow--prev"
                        onClick={() => swiperRef.current?.slidePrev()}
                        aria-label="Previous slide"
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        className="hero__arrow hero__arrow--next"
                        onClick={() => swiperRef.current?.slideNext()}
                        aria-label="Next slide"
                    >
                        →
                    </button>

                    <div className="hero__pagination" aria-label="Choose a slide">
                        {slides.map((slide, index) => (
                            <button
                                type="button"
                                key={slide.id}
                                className={`hero__dot ${index === activeIndex ? "is-active" : ""}`}
                                onClick={() => swiperRef.current?.slideToLoop(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={index === activeIndex ? "true" : undefined}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

export default Hero;
