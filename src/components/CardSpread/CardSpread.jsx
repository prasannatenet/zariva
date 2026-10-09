import { useState } from "react";
import { useGetCategoriesQuery } from "../../store/api/categoryApi";
import "./CardSpread.css";
import chainImage from "../../assets/images/category/Chain.jpg";
import braceletImage from "../../assets/images/category/Bangles-Bracelet.jpg";
import ringsImage from "../../assets/images/category/Rings.jpg";
import earringsImage from "../../assets/images/category/Earrings.jpg";

const categoryGroups = [
    {
        label: "Necklaces",
        slug: "chain",
        terms: ["necklace", "chain", "pendent", "pendant"],
        image: chainImage,
        description: "Explore delicate chains and statement pieces, crafted to bring a little elegance to every day.",
    },
    {
        label: "Bracelets",
        slug: "bangles-bracelet",
        terms: ["bracelet", "bangle"],
        image: braceletImage,
        description: "Discover bracelets and bangles made to add a graceful finishing touch to your look.",
    },
    {
        label: "Rings",
        slug: "rings",
        terms: ["ring"],
        image: ringsImage,
        description: "Find a ring for every moment, from timeless everyday styles to pieces made to celebrate.",
    },
    {
        label: "Earrings",
        slug: "earrings",
        terms: ["earring"],
        image: earringsImage,
        description: "Explore refined studs, hoops and drops designed to make every occasion feel special.",
    },
];

function CardSpread() {
    const { data } = useGetCategoriesQuery();
    const [activeIndex, setActiveIndex] = useState(0);
    const categories = data?.data || [];
    const usedCategoryIds = new Set();

    const categoryItems = categoryGroups.map((group) => {
        const category = categories.find((item) => {
            const searchableWords = `${item.name} ${item.slug}`
                .toLowerCase()
                .split(/[^a-z0-9]+/)
                .filter(Boolean)
                .map((word) => word.endsWith("s") ? word.slice(0, -1) : word);
            return !usedCategoryIds.has(item.id) &&
                group.terms.some((term) => searchableWords.includes(term));
        });

        if (category) usedCategoryIds.add(category.id);

        return {
            name: category?.name || group.label,
            slug: category?.slug || group.slug,
            image: category?.image || group.image,
            description: group.description,
        };
    });

    const activeCategory = categoryItems[activeIndex] || categoryItems[0];

    return (
        <section className="card-spread" aria-labelledby="card-spread-title">
            <div className="card-spread__layout">
                <div className="card-spread__image" aria-live="polite">
                    {activeCategory && (
                        <img
                            key={activeCategory.slug}
                            src={activeCategory.image}
                            alt={activeCategory.name}
                        />
                    )}
                </div>

                <div className="card-spread__content">
                    <span className="card-spread__eyebrow">COLLECTION</span>
                    <h2 id="card-spread-title">Discover The Beauty In Our Gallery</h2>

                    <div className="card-spread__categories" aria-label="Explore collections">
                        {categoryItems.map((category, index) => (
                            <button
                                className={`card-spread__category ${activeIndex === index ? "is-active" : ""}`}
                                key={category.slug}
                                type="button"
                                aria-pressed={activeIndex === index}
                                onClick={() => setActiveIndex(index)}
                            >
                                <span>{category.name}</span>
                                {activeIndex === index && (
                                    <span className="card-spread__description">{category.description}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CardSpread;
