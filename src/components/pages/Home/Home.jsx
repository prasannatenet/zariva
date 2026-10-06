
import { useGetCategoryProductsQuery, useGetProductsQuery } from "../../../store/api/productApi";

import Hero from "../../../components/Hero/Hero";
import Category from "../../../components/Category/Category";
import ProductCard from "../../ProductCard/ProductCard";
import SectionTitle from "../../SectionTitle/SectionTitle";
import ShopByCollection from "../../ShopByCollection/ShopByCollection";
import CardSpread from "../../CardSpread/CardSpread";
import CategoryProductShowcase from "../../CategoryProductShowcase/CategoryProductShowcase";

function Home() {
    const { data, isLoading, isError } = useGetProductsQuery({ per_page: 60 });
    const { data: ringsData } = useGetCategoryProductsQuery({ slug: "rings", per_page: 7 });
    const products = data?.data || [];
    const ringProducts = ringsData?.data || [];

    return (
        <>
            {/* Hero Slider */}
            <Hero />
            <Category />

            <section className="pt-100">
                <div className="container">
                    <SectionTitle title="Latest Collection" className="mb-30" />
                </div>
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            <CardSpread
                products={products}
                categoryName={ringsData?.category?.name || "Rings"}
                categoryUrl={ringsData?.category?.url}
            />


            <ShopByCollection products={products} isLoading={isLoading} isError={isError} />

            <CategoryProductShowcase
                products={ringProducts}
                categoryName={ringsData?.category?.name || "Rings"}
            />
        </>
    );
}

export default Home;