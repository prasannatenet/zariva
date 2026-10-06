import TopBar from "./TopBar/TopBar";
import AnnouncementBar from "./AnnouncementBar/AnnouncementBar"
import { useGetCategoriesQuery } from "../../store/api/categoryApi";
import MegaMenu from "./MegaMenu/MegaMenu";

import { Link } from "react-router-dom";

import Search from "./Search/Search";

import MobileMenu from "./MobileMenu/MobileMenu";
import HeaderActions from "./HeaderActions/HeaderActions";


import "./Header.css";
import logo from "../../assets/images/logo.png";

import { useState } from "react";



function Header() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { data: categoryData } = useGetCategoriesQuery();
    const categories = categoryData?.data || [];
    const sortedCategories = [...categories].sort(
        (firstCategory, secondCategory) =>
            (Number(secondCategory.products_count) || 0) - (Number(firstCategory.products_count) || 0)
    );
    const mainCategories = sortedCategories.slice(0, 6);
    const moreCategories = sortedCategories.slice(6);
    const moreMenuItems = moreCategories.length > 0
        ? [{ id: "more", label: "More", type: "dropdown", children: moreCategories }]
        : [];
    const navItems = [...mainCategories, ...moreMenuItems];

    return (
        <>
            <TopBar />
            <AnnouncementBar />
            <header className="site-header">
                {/* Main Header */}
                <div className="header-main">
                    <button
                        type="button"
                        className="mobile-menu-toggle"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span></span>
                        <span></span>
                    </button>

                    {/* Logo */}
                    <Link to="/" className="header-logo">
                        <img src={logo} alt="Zariva" />
                    </Link>
                    {/* Navigation */}

                    <nav className="header-nav">
                        <ul className="parent-nav">
                            {navItems.map((item) => {
                                const label = item.name || item.label;
                                const isUtilityDropdown = item.type === "dropdown";

                                return (
                                <li key={`${isUtilityDropdown ? "utility" : "category"}-${item.id ?? label}`} className={isUtilityDropdown ? "has-dropdown" : "has-mega"}>
                                    <div className="header-nav-item">
                                        <a href={item.href || (item.slug ? `/${item.slug}` : "/")}>
                                            <span className="menu-text"> {label}</span>
                                            <span className="nav-pill">
                                                {label}
                                            </span>
                                        </a>
                                        {isUtilityDropdown
                                            ? (
                                                <div className="simple-dropdown">
                                                    <span className="dropdownCorner left">
                                                        <svg className="w-full h-auto" viewBox="0 0 101 101" stroke="none" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z"></path>
                                                            <path d="M1 101C1 45.7715 45.7715 1 101 1" fill="none"></path>
                                                        </svg>
                                                    </span>
                                                    <span className="dropdownCorner right">
                                                        <svg className="w-full h-auto" viewBox="0 0 101 101" stroke="none" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M101 0H0V101H1C1 45.7715 45.7715 1 101 1V0Z"></path>
                                                            <path d="M1 101C1 45.7715 45.7715 1 101 1" fill="none"></path>
                                                        </svg>
                                                    </span>
                                                    {item.children.map((child) => (
                                                        <a
                                                            href={child.href || (child.slug ? `/${child.slug}` : "/")}
                                                            key={child.id ?? child.label}
                                                        >
                                                            {child.name || child.label}
                                                        </a>
                                                    ))}
                                                </div>
                                            )
                                            : null}
                                    </div>
                                    {!isUtilityDropdown ? <MegaMenu category={item} /> : null}
                                </li>
                                );
                            })}
                        </ul>
                    </nav>


                    {/* Actions */}
                    <div className="header-actions desktop">
                        <button
                            type="button"
                            className="header-search"
                            aria-label="Search"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 28 28"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.16016 12.6173C6.16019 9.5369 8.33629 6.88548 11.3576 6.28463C14.3789 5.68378 17.4039 7.30087 18.5825 10.1469C19.7612 12.993 18.7652 16.2753 16.2037 17.9864C13.6423 19.6976 10.2287 19.361 8.05073 17.1825C6.84018 15.9716 6.16013 14.3295 6.16016 12.6173Z"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M19.0728 19.0731L21.8403 21.8406"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        <HeaderActions />
                    </div>

                </div>

                <Search
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                />

                {/* Mobile Nav */}
                <MobileMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    categories={categories}
                />
            </header>
        </>
    );
}

export default Header;