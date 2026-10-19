import HeaderActions from "../HeaderActions/HeaderActions";
import "./MobileMenu.css";

import { useState } from "react";
import { useGetCategoriesQuery } from "../../../store/api/categoryApi";

function MobileCategoryItem({ category }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data } = useGetCategoriesQuery(category.id);
    const children = data?.data || [];

    return (
        <div className={`mobile-menu__item ${isOpen ? "is-open" : ""}`}>
            <div className="mobile-menu__item-main">
                <a href={category.slug ? `/${category.slug}` : "#"}>
                    {category.name}
                </a>
                {children.length > 0 ? (
                    <button
                        type="button"
                        className="mobile-menu__arrow"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={`Toggle ${category.name}`}
                    >
                        <span>+</span>
                    </button>
                ) : null}
            </div>
            {isOpen ? (
                <div className="mobile-menu__submenu">
                    {children.map((child) => (
                        <MobileCategoryItem key={child.id} category={child} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function MobileMenu({ isOpen, onClose, categories }) {
    return (
        <>
            <div
                className={`mobile-menu-backdrop ${isOpen ? "is-open" : ""}`}
                onClick={onClose}
            ></div>

            <aside className={`mobile-menu ${isOpen ? "is-open" : ""}`}>

                <div className="mobile-menu__header">
                    <a href="/" className="mobile-menu__logo">
                        VASHU JEWELS &amp; CRAFTS
                    </a>

                    <button
                        type="button"
                        className="mobile-menu__close"
                        aria-label="Close menu"
                        onClick={onClose}
                    >
                        <span></span>
                        <span></span>
                    </button>
                </div>

                <div className="mobile-menu__body">

                    <nav className="mobile-menu__inner">
                        {categories.map((category) => (
                            <MobileCategoryItem key={category.id} category={category} />
                        ))}
                    </nav>

                </div>

                <div className="mobile-menu__actions">
                    <HeaderActions showAccount={false} />
                </div>

            </aside>
            <div
                className={`mobile-menu-backdrop ${isOpen ? "is-open" : ""}`}
                onClick={onClose}
            ></div>
        </>
    );
}

export default MobileMenu;