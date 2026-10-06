import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";


import "./AnnouncementBar.css";
import "swiper/css";

function AnnouncementBar() {

    const announcements = [
        "Free Shipping on Orders Above ₹999",
        "Easy 7 Days Returns",
        "100% Certified Jewellery",
    ]

    return (
        <div className="header-announcement">
            <div className="announcement-container">
            <button
                type="button"
                className="announcement-prev"
                aria-label="Previous announcement"
            >
                <span className="material-symbols-outlined">
                    arrow_back_ios_new
                </span>
            </button>
            <Swiper
                modules={[Autoplay, Navigation]}
                slidesPerView={1}
                loop={true}
                navigation={{
                    prevEl: ".announcement-prev",
                    nextEl: ".announcement-next",
                }}
                autoplay={{
                    delay: 10000,
                    disableOnInteraction: false,
                }}
                speed={700}
            >
                {announcements.map((text, index) => (
                    <SwiperSlide key={index}>
                        <p>{text}</p>
                    </SwiperSlide>
                ))}
            </Swiper>
            <button
                type="button"
                className="announcement-next"
                aria-label="Next announcement"
            >
                <span className="material-symbols-outlined">
                    arrow_forward_ios
                </span>
            </button>
            </div>
        </div>
    );
}

export default AnnouncementBar;