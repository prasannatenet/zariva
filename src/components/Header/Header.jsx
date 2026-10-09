import TopBar from "./TopBar/TopBar";

import { useGetCategoriesQuery } from "../../store/api/categoryApi";
import Navigation from "./Navigation/Navigation";

import { Link } from "react-router-dom";

import Search from "./Search/Search";
import LocationSelector from "./LocationSelector/LocationSelector";

import MobileMenu from "./MobileMenu/MobileMenu";
import HeaderActions from "./HeaderActions/HeaderActions";


import "./Header.css";
import logo from "../../assets/images/logo.png";


import { useState } from "react";



function Header() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: categoryData } = useGetCategoriesQuery();
    const categories = categoryData?.data || [];

    return (
        <>
            <TopBar />

            <header className="site-header">
                <div className="container">
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
                            <div className="header-search-location">
                                <LocationSelector />
                                <Search inline />
                            </div>

                        {/* Actions */}
                        <div className="header-actions desktop">
                            <HeaderActions />
                        </div>

                    </div>

                    {/* Mobile Nav */}
                    <MobileMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                        categories={categories}
                    />
                </div>
            </header>
            <Navigation />
        </>
    );
}

export default Header;