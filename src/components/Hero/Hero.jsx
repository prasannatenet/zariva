import { useEffect, useState } from "react";
import "./Hero.css";

import heroRing from "../../assets/images/hero-ring.png";
import heroPendant from "../../assets/images/hero-pendent.png";
import heroBracelet from "../../assets/images/hero-ring.png";

function Hero() {
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

    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState("next");
    const [isAnimating, setIsAnimating] = useState(false);

    const totalSlides = slides.length;

    const nextSlide = () => {
        if (isAnimating) {
            return;
        }

        setDirection("next");
        setIsAnimating(true);

        setTimeout(() => {
            setActiveIndex((prev) => (prev + 1) % totalSlides);
            setIsAnimating(false);
        }, 800);
    };

    const prevSlide = () => {
        if (isAnimating) {
            return;
        }

        setDirection("prev");
        setIsAnimating(true);

        setTimeout(() => {
            setActiveIndex(
                (prev) => (prev - 1 + totalSlides) % totalSlides
            );
            setIsAnimating(false);
        }, 800);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 10000);

        return () => clearInterval(interval);
    }, [activeIndex, isAnimating]);

    const getPosition = (index) => {
        if (index === activeIndex) {
            return "is-center";
        }

        const nextIndex = (activeIndex + 1) % totalSlides;
        const prevIndex =
            (activeIndex - 1 + totalSlides) % totalSlides;

        if (index === nextIndex) {
            return "is-right";
        }

        if (index === prevIndex) {
            return "is-left";
        }

        return "is-hidden";
    };

    return (
        <section className="hero">

            <div
                className={`hero__slider ${
                    isAnimating ? `is-${direction}` : ""
                }`}
            >
                {slides.map((slide, index) => (
                    <div
                        className={`hero-slide ${getPosition(index)}`}
                        key={slide.id}
                    >
                        <img
                            src={slide.image}
                            alt={slide.alt}
                            className="hero-slide__image"
                        />
                    </div>
                ))}
            </div>

            <div className="hero__controls">

                <button
                    type="button"
                    className="hero__arrow"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                >
                    ←
                </button>

                <div className="hero__pagination">
                    {slides.map((slide, index) => (
                        <button
                            type="button"
                            key={slide.id}
                            className={`hero__dot ${
                                index === activeIndex
                                    ? "is-active"
                                    : ""
                            }`}
                            onClick={() => {
                                if (index === activeIndex || isAnimating) {
                                    return;
                                }

                                if (
                                    index ===
                                    (activeIndex + 1) % totalSlides
                                ) {
                                    nextSlide();
                                } else {
                                    prevSlide();
                                }
                            }}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span></span>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="hero__arrow"
                    onClick={nextSlide}
                    aria-label="Next slide"
                >
                    →
                </button>

            </div>

        </section>
    );
}

export default Hero;