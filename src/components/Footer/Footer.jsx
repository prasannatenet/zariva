import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../store/api/categoryApi";
import "./Footer.css";
import logo from "../../assets/images/logo.png";

const assurances = [
    { icon: "verified", label: "100% Certified Diamonds" },
    { icon: "local_shipping", label: "Insured Worldwide Delivery" },
    { icon: "lock", label: "Confidential & Encrypted" },
    { icon: "autorenew", label: "Lifetime Jewelry Warranty" },
];

const quickLinks = [
    { label: "Quality Jewellery", to: "/" },
    { label: "Easy Checkout", to: "/cart" },
    { label: "Contact Us", to: "/contact" },
    { label: "Order Tracking", to: "/account" },
    { label: "Wishlist", to: "/account" },
    { label: "Secure Shopping", to: "/" },
];

const informationLinks = [
    { label: "Terms of Use", to: "/terms-of-use" },
    { label: "Cookies Policy", to: "/cookies-policy" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Shipping & Return Policies", to: "/shipping-returns" },
];

function FooterLinkColumn({ title, links }) {
    return (
        <div className="site-footer__column">
            <h2><span aria-hidden="true" />{title}</h2>
            <ul>
                {links.map((link) => (
                    <li key={link.label}>
                        <Link to={link.to}>{link.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Footer() {
    const { data: categoryData } = useGetCategoriesQuery();
    const categories = (categoryData?.data || []).slice(0, 5);

    return (
        <footer className="site-footer">
            <div className="site-footer__assurances">
                <div className="site-footer__assurances-inner">
                    {assurances.map((assurance) => (
                        <div className="site-footer__assurance" key={assurance.label}>
                            <span className="material-symbols-outlined" aria-hidden="true">{assurance.icon}</span>
                            <span>{assurance.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="site-footer__main">
                <div className="site-footer__inner">
                    <div className="site-footer__brand">
                        <Link to="/" className="site-footer__logo">
                            <img src={logo} alt="" />
                        </Link>
                        <h2>Corporate Office &amp; Flagship</h2>
                        <address>
                            Unit No. 1, Ground Floor, 20 New Road,<br />
                            Bandra West, Mumbai - 654987,<br />
                            Maharashtra, India
                        </address>
                        <p>CIN: JIEHHG4536GF89R</p>
                    </div>

                    <FooterLinkColumn title="Quick Links" links={quickLinks.slice(0, 3)} />
                    <FooterLinkColumn title="Quick Links" links={quickLinks.slice(3)} />

                    <FooterLinkColumn
                        title="Categories"
                        links={categories.map((category) => ({
                            label: category.name,
                            to: `/${category.slug}`,
                        }))}
                    />
                    <FooterLinkColumn title="Information" links={informationLinks} />
                </div>
            </div>

            <div className="site-footer__bottom">
                <div className="site-footer__bottom-inner">
                    <div>
                        <p>© 2026, Vashu Jewels &amp; Crafts. All Rights Reserved.</p>
                        <p>Official registered corporate entity: CIN JIEHHG4536GF89R • Bandra West, Mumbai</p>
                    </div>
                    <div className="site-footer__socials" aria-label="Social links">
                        <span>Follow Us</span>
                        <a href="https://www.facebook.com" aria-label="Facebook">f</a>
                        <a href="https://www.instagram.com" aria-label="Instagram">◎</a>
                        <a href="https://twitter.com" aria-label="X">X</a>
                        <a href="https://www.youtube.com" aria-label="YouTube">▶</a>
                        <a href="https://www.pinterest.com" aria-label="Pinterest">p</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
