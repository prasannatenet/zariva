import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebookF,
    faInstagram,
    faPinterestP,
    faWhatsapp,
    faXTwitter,
    faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { useGetCategoriesQuery } from "../../store/api/categoryApi";
import { useGetSettingsQuery } from "../../store/api/productApi";
import "./Footer.css";
import fallbackLogo from "../../assets/images/logo.png";

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

// Map common social platform names to their brand icon and accessible label.
const SOCIAL_ICONS = {
    facebook: { label: "Facebook", icon: faFacebookF },
    instagram: { label: "Instagram", icon: faInstagram },
    twitter: { label: "X / Twitter", icon: faXTwitter },
    x: { label: "X", icon: faXTwitter },
    youtube: { label: "YouTube", icon: faYoutube },
    pinterest: { label: "Pinterest", icon: faPinterestP },
    whatsapp: { label: "WhatsApp", icon: faWhatsapp },
};

function getSocialMeta(platform) {
    const key = (platform || "").toLowerCase();
    return SOCIAL_ICONS[key] ?? { label: platform, char: platform?.[0]?.toUpperCase() ?? "•" };
}

function SocialIcon({ meta }) {
    return meta.icon
        ? <FontAwesomeIcon icon={meta.icon} aria-hidden="true" />
        : meta.char;
}

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

    const { data: settingsData } = useGetSettingsQuery();
    const settings = settingsData?.data ?? {};

    const logoSrc = settings.logo || fallbackLogo;
    const siteName = settings.site_name || "Vasuh Jewels & Crafts";
    const description = settings.description || null;
    const phone = settings.phone || null;
    const email = settings.email || null;
    const address = [
        settings.address,
        settings.city,
        settings.state,
        settings.zip ? `- ${settings.zip}` : null,
        settings.country,
    ].filter(Boolean).join(", ") || null;

    // Social links: API returns an array or object of { platform, url }
    const socialLinks = (() => {
        const raw = settings.social;
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === "object") {
            return Object.entries(raw).map(([platform, url]) => ({ platform, url }));
        }
        return [];
    })();

    const currentYear = new Date().getFullYear();

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
                            <img src={fallbackLogo} alt={siteName} />
                        </Link>
                        {description && <p className="site-footer__description">{description}</p>}
                        {address && (
                            <address>
                                {address.split(",").map((part, i, arr) => (
                                    <span key={i}>{part.trim()}{i < arr.length - 1 ? "," : ""}<br /></span>
                                ))}
                            </address>
                        )}
                        {phone && (
                            <p>
                                <a href={`tel:${phone}`}>{phone}</a>
                            </p>
                        )}
                        {email && (
                            <p>
                                <a href={`mailto:${email}`}>{email}</a>
                            </p>
                        )}
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
                        <p>© {currentYear}, {siteName}. All Rights Reserved.</p>
                    </div>
                    <div className="site-footer__socials" aria-label="Social links">
                        <span>Follow Us</span>
                        {socialLinks.length > 0 ? (
                            socialLinks.map(({ platform, url }) => {
                                const meta = getSocialMeta(platform);
                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        aria-label={meta.label}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <SocialIcon meta={meta} />
                                    </a>
                                );
                            })
                        ) : (
                            <>
                                <a href="https://www.facebook.com" aria-label="Facebook"><SocialIcon meta={SOCIAL_ICONS.facebook} /></a>
                                <a href="https://www.instagram.com" aria-label="Instagram"><SocialIcon meta={SOCIAL_ICONS.instagram} /></a>
                                <a href="https://twitter.com" aria-label="X"><SocialIcon meta={SOCIAL_ICONS.x} /></a>
                                <a href="https://www.youtube.com" aria-label="YouTube"><SocialIcon meta={SOCIAL_ICONS.youtube} /></a>
                                <a href="https://www.pinterest.com" aria-label="Pinterest"><SocialIcon meta={SOCIAL_ICONS.pinterest} /></a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
