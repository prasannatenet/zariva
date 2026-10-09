
import { useGetProductsQuery } from "../../../store/api/productApi";

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
                    <SectionTitle title="Latest Collection" className="mb-30" />
                    <div className="product-grid">
                        {latestProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            <CardSpread />
            <VideoGallery />
            <InstagramSection products={products} />

        </>
    );
}

export default Home;