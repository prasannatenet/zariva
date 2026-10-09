

import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import { useGetCategoriesQuery } from "../../store/api/categoryApi";
import SectionTitle from "../SectionTitle/SectionTitle";


import "swiper/css";
import "swiper/css/navigation";



import "./Category.css";


const Category = () => {

    const { data, isLoading, isError } = useGetCategoriesQuery();

    const categories = data?.data || [];

    if (isLoading) {
        return <p>Loading categories...</p>;
    }

    if (isError) {
        return <p>Unable to load categories.</p>;
    }

    return (
        <section className="category-section pt-30 pb-50">
            <div className="container-fluid">
               <SectionTitle title="Shop By Category" className="mb-30" />
                <div className="category-slider-wrapper">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        className="category-swiper"
                        slidesPerView={6.25}
                        spaceBetween={20}
                        slidesPerGroup={1}
                        loop={true}
                        speed={800}

                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}

                        navigation={{
                            nextEl: ".category-next",
                            prevEl: ".category-prev",
                        }}

                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                                spaceBetween: 12,
                            },

                            576: {
                                slidesPerView: 1,
                                spaceBetween: 15,
                            },

                            768: {
                                slidesPerView: 3.5,
                                spaceBetween: 16,
                            },

                            992: {
                                slidesPerView: 4.5,
                                spaceBetween: 18,
                            },

                            1200: {
                                slidesPerView: 4,
                                spaceBetween: 20,
                            },
                        }}
                    >
                        {categories.map((category) => (
                            <SwiperSlide key={category.id}>
                                <Link
                                    to={`/${category.slug}`}
                                    className="category-card category-card-link"
                                >
                                    <div className="category-image">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                        />
                                    </div>

                                    <div className="category-caption">
                                        <h3 className="category-name">
                                            {category.name}
                                        </h3>
                                        <span className="category-show-now">
                                            Show Now
                                        </span>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button
                        className="category-nav category-prev"
                        aria-label="Previous category"
                    >
                        &#8592;
                    </button>

                    <button
                        className="category-nav category-next"
                        aria-label="Next category"
                    >
                        &#8594;
                    </button>

                </div>
            </div>
        </section>
    );
};

export default Category;