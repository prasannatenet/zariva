import { useGetCategoriesQuery } from "../../../store/api/categoryApi";
import MegaMenu from "../MegaMenu/MegaMenu";
import "./Navigation.css";

function Navigation() {
    const { data: categoryData } = useGetCategoriesQuery();
    const categories = categoryData?.data || [];
    const sortedCategories = [...categories].sort(
        (firstCategory, secondCategory) =>
            (Number(secondCategory.products_count) || 0) - (Number(firstCategory.products_count) || 0)
    );
    const mainCategories = sortedCategories.slice(0, 6);
    const moreCategories = sortedCategories.slice(6);
    const navItems = moreCategories.length > 0
        ? [...mainCategories, { id: "more", label: "More", type: "dropdown", children: moreCategories }]
        : mainCategories;

    return (
        <div className="header-nav-wrapper">
            <div className="container">
                <nav className="header-nav">
                    <ul className="parent-nav">
                        {navItems.map((item) => {
                            const label = item.name || item.label;
                            const isUtilityDropdown = item.type === "dropdown";

                            return (
                                <li
                                    key={`${isUtilityDropdown ? "utility" : "category"}-${item.id ?? label}`}
                                    className={isUtilityDropdown ? "has-dropdown" : "has-mega"}
                                >
                                    <div className="header-nav-item">
                                        <a href={item.href || (item.slug ? `/${item.slug}` : "/")}>
                                            <span className="menu-text">{label}</span>
                                            <span className="nav-pill">{label}</span>
                                        </a>
                                        {isUtilityDropdown ? (
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
                                        ) : null}
                                    </div>
                                    {!isUtilityDropdown ? <MegaMenu category={item} /> : null}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default Navigation;
