import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSearchQuery } from "../../../store/api/productApi";
import "./Search.css";

const searchSuggestions = [
    "Pendant",
    "Ring",
    "Necklace",
    "Bracelet",
    "Earrings",
];

function Search({ isOpen = false, onClose, inline = false }) {
    const searchIsOpen = inline || isOpen;
    const [searchSuggestion, setSearchSuggestion] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const searchWrapperRef = useRef(null);
    const searchInputRef = useRef(null);
    const navigate = useNavigate();
    const showResults = searchIsOpen && isFocused && query.trim().length >= 2;
    const { data, isFetching, isError } = useGetSearchQuery(
        { q: debouncedQuery, per_page: 6 },
        { skip: !showResults || debouncedQuery.length < 2 }
    );

    const products = data?.data || [];
    const categories = data?.meta?.categories || [];
    const hasResults = products.length > 0 || categories.length > 0;

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        if (!searchIsOpen) return undefined;

        const handleOutsidePointer = (event) => {
            if (!searchWrapperRef.current?.contains(event.target)) {
                setIsFocused(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsidePointer);
        return () => document.removeEventListener("pointerdown", handleOutsidePointer);
    }, [searchIsOpen]);

    useEffect(() => {
        if (!searchIsOpen) {
            return;
        }

        const interval = setInterval(() => {
            setIsAnimating(true);

            setTimeout(() => {
                setSearchSuggestion(
                    (prev) => (prev + 1) % searchSuggestions.length
                );

                setIsAnimating(false);
            }, 600);
        }, 2200);

        return () => clearInterval(interval);
    }, [searchIsOpen]);

    const closeSearch = () => {
        setQuery("");
        setDebouncedQuery("");
        setIsFocused(false);
        searchInputRef.current?.blur();
        onClose?.();
    };

    const handleSearchIconClick = () => {
        if (isFocused || query.trim()) {
            closeSearch();
            return;
        }

        searchInputRef.current?.focus();
    };

    const openResult = (path) => {
        navigate(path);
        closeSearch();
    };

    return (
        <div className={`search-panel ${searchIsOpen ? "is-open" : ""} ${inline ? "search-panel--inline" : ""}`}>
            <div className="search-panel__inner">
                <div className={`search-input-wrapper${query.trim() ? " has-query" : ""}`} ref={searchWrapperRef}>
                    <span className="search-placeholder" aria-hidden="true">
                        <span>Search:</span>

                        <span
                            className={`search-placeholder__word ${isAnimating ? "is-exiting" : ""
                                }`}
                        >
                            {searchSuggestions[searchSuggestion]}
                        </span>
                    </span>
                    <input
                        ref={searchInputRef}
                        type="text"
                        aria-label="Search jewellery"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />

                    {inline ? (
                        <button
                            className="search-input-icon"
                            type="button"
                            onClick={handleSearchIconClick}
                            aria-label={isFocused || query.trim() ? "Clear search" : "Focus search"}
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">
                                {isFocused || query.trim() ? "close" : "search"}
                            </span>
                        </button>
                    ) : null}

                    {showResults ? (
                        <div className="search-results" role="listbox" aria-label="Search results">
                            {isFetching ? <p className="search-results__state">Searching...</p> : null}
                            {!isFetching && isError ? <p className="search-results__state">Search is unavailable right now.</p> : null}
                            {!isFetching && !isError && !hasResults ? <p className="search-results__state">No matching jewellery found.</p> : null}

                            {!isFetching && !isError && categories.length > 0 ? (
                                <div className="search-results__section">
                                    <span className="search-results__heading">Categories</span>
                                    {categories.slice(0, 4).map((category) => (
                                        <button
                                            className="search-result search-result--category"
                                            type="button"
                                            role="option"
                                            key={category.id}
                                            onClick={() => openResult(`/${category.slug}`)}
                                        >
                                            <span>{category.name}</span>
                                            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            {!isFetching && !isError && products.length > 0 ? (
                                <div className="search-results__section">
                                    <span className="search-results__heading">Products</span>
                                    {products.map((product) => (
                                        <button
                                            className="search-result"
                                            type="button"
                                            role="option"
                                            key={product.id}
                                            onClick={() => openResult(`/product/${product.slug}`)}
                                        >
                                            <span className="search-result__image">
                                                {product.primary_image || product.images?.[0] ? (
                                                    <img src={product.primary_image || product.images[0]} alt="" />
                                                ) : null}
                                            </span>
                                            <span className="search-result__copy">
                                                <strong>{product.name}</strong>
                                                <span>₹{Number(product.price).toLocaleString("en-IN")}</span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {!inline ? (
                    <button
                        type="button"
                        className="search-panel__close"
                        onClick={closeSearch}
                        aria-label="Close search"
                    >
                        <span></span>
                        <span></span>
                    </button>
                ) : null}

            </div>
        </div>
    );
}

export default Search;