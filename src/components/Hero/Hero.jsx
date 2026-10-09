import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./Hero.css";

import heroRing from "../../assets/images/BANNER_01.png";
import heroPendant from "../../assets/images/BANNER_02.png";
import heroBracelet from "../../assets/images/BANNER_03.png";

function Hero() {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const slides = [
        {
            id: 1,
            image: heroRing,
            alt: "Ring Collection",
        },
        {
            id: 2,
            image: heroPendant,
            alt: "Pendant Collection",
        },
        {
            id: 3,
            image: heroBracelet,
            alt: "Bracelet Collection",
        },
    ];
    const loopSlides = [...slides, ...slides].map((slide, index) => ({
        ...slide,
        id: `${slide.id}-${index}`,
    }));

    return (
        <section className="hero">
            <Swiper
                modules={[Autoplay]}
                className="hero__swiper"
                slidesPerView={1.24}
                spaceBetween="1%"
                centeredSlides
                loop
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
                {loopSlides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <img
                            src={slide.image}
                            alt={slide.alt}
                            className="hero-slide__image"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

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
        </section>
    );
}

export default Hero;
