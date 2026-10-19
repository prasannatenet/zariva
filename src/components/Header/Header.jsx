import TopBar from "./TopBar/TopBar";
import { useGetCategoriesQuery } from "../../store/api/categoryApi";
import { useGetSettingsQuery } from "../../store/api/productApi";
import Navigation from "./Navigation/Navigation";
import { Link } from "react-router-dom";
import Search from "./Search/Search";
import LocationSelector from "./LocationSelector/LocationSelector";
import MobileMenu from "./MobileMenu/MobileMenu";
import HeaderActions from "./HeaderActions/HeaderActions";
import "./Header.css";
import fallbackLogo from "../../assets/images/logo.png";


import { useEffect, useRef, useState } from "react";



function Header() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef(null);
    const headerPlaceholderRef = useRef(null);
    const { data: categoryData } = useGetCategoriesQuery();
    const categories = categoryData?.data || [];
    const { data: settingsData } = useGetSettingsQuery();
    const settings = settingsData?.data ?? {};
    const logoSrc = settings.logo || fallbackLogo;
    const siteName = settings.site_name || "Vashu Jewels & Crafts";

    useEffect(() => {
        const updateHeaderPosition = () => {
            const header = headerRef.current;
            const placeholder = headerPlaceholderRef.current;
            if (!header || !placeholder) return;

            const fixedThreshold = placeholder.getBoundingClientRect().top + window.scrollY;
            const shouldFixHeader = window.scrollY >= fixedThreshold;
            setHeaderHeight(header.offsetHeight);
            setIsHeaderFixed(shouldFixHeader);
        };

        updateHeaderPosition();
        window.addEventListener("scroll", updateHeaderPosition, { passive: true });
        window.addEventListener("resize", updateHeaderPosition);

        return () => {
            window.removeEventListener("scroll", updateHeaderPosition);
            window.removeEventListener("resize", updateHeaderPosition);
        };
    }, []);

    return (
        <>
            <TopBar />

            <div
                className="site-header-placeholder"
                ref={headerPlaceholderRef}
                style={{ height: isHeaderFixed ? `${headerHeight}px` : undefined }}
            >
                <header className={`site-header${isHeaderFixed ? " is-fixed" : ""}`} ref={headerRef}>
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
                                <img src={logoSrc} alt={siteName} />
                            </Link>
                            <div className="header-search-location">
                                <LocationSelector />
                                <div className="header-actions mobile-account-actions">
                                    <HeaderActions accountOnly />
                                </div>
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
            </div>
            <Navigation />
        </>
    );
}

export default Header;