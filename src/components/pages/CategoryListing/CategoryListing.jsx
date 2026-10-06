import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetCategoriesQuery } from "../../../store/api/categoryApi";
import { useGetCategoryProductsQuery } from "../../../store/api/productApi";
import ProductCard from "../../ProductCard/ProductCard";
import "./CategoryListing.css";

const filterSections = [
    {
        title: "Jewellery Type",
        options: ["Solitaire Jewellery", "Diamond Jewellery", "Platinum Jewellery"],
    },
    {
        title: "Product Type",
        options: ["Earring", "Ring"],
    },
    { title: "Metal Purity", options: ["18KT"] },
    {
        title: "Metal Colour",
        options: ["Rose Gold", "Yellow Gold", "White Gold"],
        swatches: ["#e9b7a4", "#f0ce53", "#d7d9dc"],
    },
    {
        title: "Occasion",
        options: ["Engagement", "Everyday", "Festive", "Partywear", "Wedding", "Anniversary", "Birthday"],
    },
    {
        title: "Shop by design",
        options: ["3 Stone", "Casual", "Geometric", "Halo", "Illusion", "Solitaire", "Textured"],
        initiallyVisible: 5,
    },
    {
        title: "Size",
        options: ["8", "9", "10", "11", "12", "13", "14"],
        initiallyVisible: 5,
    },
    { title: "Gender", options: ["Men", "Unisex", "Women"] },
];
const emptyProducts = [];

const normalize = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function productSearchText(product) {
    return normalize([
        product.name,
        product.description,
        product.short_description,
        product.audience,
        product.material_type,
        product.product_type,
        product.metal_purity,
        product.metal_colour,
        product.color,
        product.style,
        product.occasion,
        product.design,
        product.size,
        product.sizes,
        product.category?.name,
        product.attributes,
        product.variations?.map((variation) => variation.attributes),
    ].flat().join(" "));
}

function optionMatches(product, section, option) {
    const text = productSearchText(product);
    const value = normalize(option);
    const aliases = {
        "solitairejewellery": ["solitaire"],
        "diamondjewellery": ["diamond", "american diamond"],
        "platinumjewellery": ["platinum"],
        "earring": ["earring"],
        "ring": ["ring"],
        "18kt": ["18kt", "18k", "18 karat"],
        "rosegold": ["rose gold", "rosegold"],
        "yellowgold": ["yellow gold", "gold"],
        "whitegold": ["white gold"],
        "3stone": ["3 stone", "three stone"],
    };
    const tokens = aliases[value] || [option];

    if (section === "Gender") {
        const audience = normalize(product.audience);
        return value === "women"
            ? audience.includes("women") || audience.includes("female")
            : value === "men"
                ? audience.includes("men") || audience.includes("male")
                : audience.includes("unisex");
    }

    return tokens.some((token) => text.includes(normalize(token)));
}

function CategoryListing() {
    const { slug } = useParams();
    const [selectedFilters, setSelectedFilters] = useState({});
    const [priceRange, setPriceRange] = useState(null);
    const [sortBy, setSortBy] = useState("latest");
    const [expandedSections, setExpandedSections] = useState({});
    const [showMoreOptions, setShowMoreOptions] = useState({});
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const { data, isLoading, isError } = useGetCategoryProductsQuery({ slug, per_page: 100 });
    const category = data?.category;
    const products = data?.data || emptyProducts;
    const { data: groupsData } = useGetCategoriesQuery(category?.id, { skip: !category?.id });
    const categoryGroups = groupsData?.data || [];
    const styleGroup = categoryGroups.find((group) => /style/i.test(group.name));
    const { data: stylesData } = useGetCategoriesQuery(styleGroup?.id, { skip: !styleGroup?.id });
    const styleOptions = (stylesData?.data || []).map((style) => style.name);

    const priceBounds = useMemo(() => {
        const prices = products.map((product) => Number(product.price)).filter(Number.isFinite);
        return prices.length
            ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
            : { min: 0, max: 100000 };
    }, [products]);
    const activePriceRange = priceRange || priceBounds;

    const sections = [
        ...filterSections.slice(0, 2),
        { title: "Price", options: [] },
        filterSections[2],
        filterSections[3],
        ...(styleGroup ? [{ title: "Shop By Style", options: styleOptions }] : [{ title: "Shop By Style", options: [] }]),
        ...filterSections.slice(4),
    ];

    const filteredProducts = useMemo(() => {
        let result = products.filter((product) => {
            const price = Number(product.price) || 0;
            if (price < activePriceRange.min || price > activePriceRange.max) return false;

            return Object.entries(selectedFilters).every(([section, options]) =>
                options.every((option) => optionMatches(product, section, option))
            );
        });

        if (sortBy === "price-low") result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
        if (sortBy === "price-high") result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
        if (sortBy === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === "latest") result = [...result].reverse();
        return result;
    }, [products, selectedFilters, activePriceRange, sortBy]);

    const selectedChips = Object.entries(selectedFilters).flatMap(([section, options]) =>
        options.map((option) => ({ section, option, key: `${section}:${option}` }))
    );

    const toggleFilter = (section, option) => {
        setSelectedFilters((current) => {
            const values = current[section] || [];
            const nextValues = values.includes(option)
                ? values.filter((value) => value !== option)
                : [...values, option];
            return { ...current, [section]: nextValues };
        });
    };

    const clearAll = () => {
        setSelectedFilters({});
        setPriceRange(null);
    };

    const removeChip = ({ section, option }) => {
        setSelectedFilters((current) => ({
            ...current,
            [section]: (current[section] || []).filter((value) => value !== option),
        }));
    };

    const renderOptions = (section) => {
        const visibleOptions = section.initiallyVisible && !showMoreOptions[section.title]
            ? section.options.slice(0, section.initiallyVisible)
            : section.options;

        if (section.title === "Price") {
            return null;
        }

        return (
            <>
                {visibleOptions.map((option, index) => {
                    const checked = (selectedFilters[section.title] || []).includes(option);
                    const count = products.filter((product) => optionMatches(product, section.title, option)).length;
                    return (
                        <label className={`listing-filter__option ${section.swatches ? "has-swatch" : ""}`} key={option}>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleFilter(section.title, option)}
                            />
                            {section.swatches ? <span className="listing-filter__swatch" style={{ "--swatch-color": section.swatches[index] }} /> : null}
                            <span>{option} <small>({count})</small></span>
                        </label>
                    );
                })}
                {section.initiallyVisible && section.options.length > section.initiallyVisible ? (
                    <button
                        className="listing-filter__more"
                        type="button"
                        onClick={() => setShowMoreOptions((current) => ({ ...current, [section.title]: !current[section.title] }))}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            {showMoreOptions[section.title] ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                        </span>
                        {showMoreOptions[section.title] ? "See Less" : "See More"}
                    </button>
                ) : null}
            </>
        );
    };

    if (isLoading) return <div className="category-listing__state loading"> <span className="loading__spinner" aria-hidden="true"></span> Loading collection...</div>;
    if (isError || !category) return <div className="category-listing__state" role="alert">This collection could not be loaded.</div>;

    return (
        <main className="category-listing">
            <div className="category-listing__heading">
                <div className="container">
                    <div className="category-listing__breadcrumb">
                        <Link to="/">Home</Link><span>/</span><span>{category.name}</span>
                    </div>
                    <h1>{category.name} <span>({data?.meta?.total ?? products.length} Designs)</span></h1>
                </div>
            </div>

            <div className="category-listing__layout">
                <aside className={`listing-filters ${isFilterDrawerOpen ? "is-open" : ""}`} aria-label="Product filters">
                    <div className="listing-filters__header">
                        <h2>Filters</h2>
                        <button type="button" onClick={clearAll}>Clear All</button>
                        <button className="listing-filters__close" type="button" aria-label="Close filters" onClick={() => setIsFilterDrawerOpen(false)}>
                            <span className="material-symbols-outlined" aria-hidden="true">close</span>
                        </button>
                    </div>
                    <div className="listing-filters__scroll">
                        {sections.map((section) => {
                            const isExpanded = expandedSections[section.title] !== false;
                            return (
                                <section className="listing-filter" key={section.title}>
                                    <button
                                        className="listing-filter__heading"
                                        type="button"
                                        aria-expanded={isExpanded}
                                        onClick={() => setExpandedSections((current) => ({ ...current, [section.title]: !isExpanded }))}
                                    >
                                        <span>{section.title}</span>
                                        <span className="material-symbols-outlined" aria-hidden="true">{isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
                                    </button>
                                    {isExpanded ? (
                                        section.title === "Price" ? (
                                            <div className="listing-filter__body listing-filter__price">
                                                <div className="listing-price-range">
                                                    <input
                                                        type="range"
                                                        aria-label="Minimum price"
                                                        min={priceBounds.min}
                                                        max={priceBounds.max}
                                                        value={activePriceRange.min}
                                                        onChange={(event) => setPriceRange({ ...activePriceRange, min: Math.min(Number(event.target.value), activePriceRange.max) })}
                                                    />
                                                    <input
                                                        type="range"
                                                        aria-label="Maximum price"
                                                        min={priceBounds.min}
                                                        max={priceBounds.max}
                                                        value={activePriceRange.max}
                                                        onChange={(event) => setPriceRange({ ...activePriceRange, max: Math.max(Number(event.target.value), activePriceRange.min) })}
                                                    />
                                                </div>
                                                <div className="listing-price-inputs">
                                                    <label>₹ <input type="number" aria-label="Minimum price amount" value={activePriceRange.min} min={priceBounds.min} max={activePriceRange.max} onChange={(event) => setPriceRange({ ...activePriceRange, min: Number(event.target.value) })} /></label>
                                                    <label>₹ <input type="number" aria-label="Maximum price amount" value={activePriceRange.max} min={activePriceRange.min} max={priceBounds.max} onChange={(event) => setPriceRange({ ...activePriceRange, max: Number(event.target.value) })} /></label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="listing-filter__body">
                                                {renderOptions(section)}
                                            </div>
                                        )
                                    ) : null}
                                </section>
                            );
                        })}
                    </div>
                </aside>

                {isFilterDrawerOpen ? <button className="listing-filters__backdrop" type="button" aria-label="Close filters" onClick={() => setIsFilterDrawerOpen(false)} /> : null}

                <section className="category-listing__results" aria-label={`${category.name} products`}>
                    <div className="listing-toolbar">
                        <button className="listing-toolbar__filter-button" type="button" onClick={() => setIsFilterDrawerOpen(true)}>
                            <span className="material-symbols-outlined" aria-hidden="true">tune</span> Filters
                        </button>
                        <div className="listing-toolbar__chips">
                            {selectedChips.map((chip) => (
                                <button className="listing-chip" key={chip.key} type="button" onClick={() => removeChip(chip)}>
                                    {chip.option}<span aria-hidden="true">×</span>
                                </button>
                            ))}
                            {priceRange ? (
                                <button className="listing-chip" type="button" onClick={() => setPriceRange(null)}>
                                    ₹{priceRange.min.toLocaleString("en-IN")} - ₹{priceRange.max.toLocaleString("en-IN")}<span aria-hidden="true">×</span>
                                </button>
                            ) : null}
                        </div>
                        <label className="listing-sort">SORT BY:
                            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort products">
                                <option value="latest">New Arrival</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name</option>
                            </select>
                        </label>
                    </div>

                    {filteredProducts.length ? (
                        <div className="category-listing__grid">
                            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <div className="category-listing__empty">
                            <h2>No designs match these filters</h2>
                            <p>Try removing a filter or widening your price range.</p>
                            <button type="button" onClick={clearAll}>Clear filters</button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default CategoryListing;