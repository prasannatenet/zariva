
import { useGetProductsQuery } from "../../../store/api/productApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";

import Hero from "../../../components/Hero/Hero";
import Category from "../../../components/Category/Category";
import ProductCard from "../../ProductCard/ProductCard";
import SectionTitle from "../../SectionTitle/SectionTitle";
import CardSpread from "../../CardSpread/CardSpread";
import NewArrivals from "../../NewArrivals/NewArrivals";
import VideoGallery from "../../VideoGallery/VideoGallery";
import HotOffer from "../../HotOffer/HotOffer";
import InstagramSection from "../../InstagramSection/InstagramSection";

function Home() {
    const { data } = useGetProductsQuery({ per_page: 60 });
    const products = data?.data || [];
    const latestProducts = products.slice(0, 8);

    return (
        <>
            {/* Hero Slider */}
            <Hero />
            <Category />
            <NewArrivals />
            <HotOffer />

            <section className="latest-collection py-60">
                <div className="container">
                    <div className="home-product-carousel__header">
                        <SectionTitle title="Latest Collection" className="mb-30" />
                        <div className="home-product-carousel__nav" aria-label="Latest collection navigation">
                            <button type="button" className="home-product-carousel__arrow latest-collection__arrow--prev" aria-label="Previous latest products">
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                            </button>
                            <button type="button" className="home-product-carousel__arrow latest-collection__arrow--next" aria-label="Next latest products">
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                    <Swiper
                        modules={[Navigation]}
                        slidesPerView={1.2}
                        spaceBetween={16}
                        navigation={{
                            prevEl: ".latest-collection__arrow--prev",
                            nextEl: ".latest-collection__arrow--next",
                        }}
                        breakpoints={{
                            576: { slidesPerView: 2, spaceBetween: 16 },
                            768: { slidesPerView: 3, spaceBetween: 18 },
                            1024: { slidesPerView: 4, spaceBetween: 20 },
                        }}
                    >
                        {latestProducts.map((product) => (
                            <SwiperSlide key={product.id}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            <section className="latest-collection py-60">
                <div className="container">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "1.6rem",
                            marginBottom: "2.4rem",
                        }}
                    >
                        <SectionTitle title="Best Seller" className="mb-30" />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }} aria-label="Best seller navigation">
                            <button
                                type="button"
                                className="best-seller__arrow best-seller__arrow--prev"
                                aria-label="Previous products"
                                style={{
                                    display: "grid",
                                    placeItems: "center",
                                    width: "3.6rem",
                                    height: "3.6rem",
                                    border: "1px solid rgba(16, 28, 53, 0.18)",
                                    background: "#fff",
                                    color: "var(--p-900)",
                                    cursor: "pointer",
                                }}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                            </button>
                            <button
                                type="button"
                                className="best-seller__arrow best-seller__arrow--next"
                                aria-label="Next products"
                                style={{
                                    display: "grid",
                                    placeItems: "center",
                                    width: "3.6rem",
                                    height: "3.6rem",
                                    border: "1px solid rgba(16, 28, 53, 0.18)",
                                    background: "#fff",
                                    color: "var(--p-900)",
                                    cursor: "pointer",
                                }}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    <Swiper
                        modules={[Navigation]}
                        slidesPerView={1.2}
                        spaceBetween={16}
                        navigation={{
                            prevEl: ".best-seller__arrow--prev",
                            nextEl: ".best-seller__arrow--next",
                        }}
                        breakpoints={{
                            576: { slidesPerView: 2, spaceBetween: 16 },
                            768: { slidesPerView: 3, spaceBetween: 18 },
                            1024: { slidesPerView: 4, spaceBetween: 20 },
                        }}
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id}>
                                <ProductCard product={product} imageMode="swiper" />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            <CardSpread />
            <VideoGallery />
            <InstagramSection products={products} />

        </>
    );
}

export default Home;