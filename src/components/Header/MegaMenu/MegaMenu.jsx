import rignModal from "../../../assets/images/7043.jpg"
import "./MegaMenu.css";
import { useGetCategoriesQuery } from "../../../store/api/categoryApi";

function MegaMenuColumn({ category }) {
    const { data } = useGetCategoriesQuery(category.id);
    const children = data?.data || [];

    return (
        <div className="mega-menu__column">
            <h4>{category.name}</h4>
            {children.map((child) => (
                <a key={child.id} href={child.slug ? `/${child.slug}` : "#"}>
                    {child.name}
                </a>
            ))}
        </div>
    );
}

function MegaMenu({ category }) {
    const { data } = useGetCategoriesQuery(category.id);
    const groups = data?.data || [];

    if (groups.length === 0) {
        return null;
    }

    const featuredGroup = groups.find((group) => group.id === 18);

    return (
        <div className="mega-menu">
            <div className="mega-menu__inner">
                {groups.map((group) => (
                    <MegaMenuColumn key={group.id} category={group} />
                ))}

                <div className="mega-menu__featured">
                    <div className="mega-menu__image">
                        <img
                            src={featuredGroup?.image || rignModal}
                            alt={featuredGroup?.name || "Ring Collection"}
                        />
                    </div>
                    <div className="mega-menu__featured-content">
                        <span>FEATURED</span>
                        <h3>
                            Timeless
                            <br />
                            Rings
                        </h3>

                        <a href="/rings">Explore Collection</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MegaMenu;