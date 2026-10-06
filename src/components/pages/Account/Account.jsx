import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../../store/api/authApi";
import { clearUser } from "../../../store/slices/authSlice";
import { removeWishlistItem } from "../../../store/slices/wishlistSlice";
import "./Account.css";

function Account() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const wishlist = useSelector((state) => state.wishlist);
    const [activeView, setActiveView] = useState("overview");
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
    const initials = (user?.name || "Z")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("gehna_api_token");
            dispatch(clearUser());
            navigate("/login", { state: { backgroundLocation: location } });
        }
    };

    const navigationItems = [
        { id: "overview", label: "Overview", icon: "space_dashboard" },
        { id: "details", label: "Personal details", icon: "person" },
        { id: "wishlist", label: "Wishlist", icon: "favorite", count: wishlist.length },
    ];

    const viewTitle = {
        overview: "Your account, at a glance.",
        details: "The details that make it yours.",
        wishlist: "Pieces you have your eye on.",
    }[activeView];

    const renderProduct = (product, compact = false) => {
        const productKey = String(product.id ?? product.slug);

        return (
            <article className={`account-wishlist-item${compact ? " is-compact" : ""}`} key={productKey}>
                <Link
                    className="account-wishlist-item__image"
                    to={product.slug ? `/product/${product.slug}` : "/"}
                    aria-label={`View ${product.name || "wishlist piece"}`}
                >
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name || ""} />
                    ) : (
                        <span className="material-symbols-outlined" aria-hidden="true">diamond</span>
                    )}
                </Link>
                <div className="account-wishlist-item__copy">
                    <Link to={product.slug ? `/product/${product.slug}` : "/"}>
                        {product.name || "A Zariva favourite"}
                    </Link>
                    {product.price != null && (
                        <span>₹{Number(product.price).toLocaleString("en-IN")}</span>
                    )}
                </div>
                <button
                    className="account-icon-button"
                    type="button"
                    aria-label={`Remove ${product.name || "piece"} from wishlist`}
                    onClick={() => dispatch(removeWishlistItem(productKey))}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
            </article>
        );
    };

    return (
        <main className="account-page">
            <div className="account-shell">
                <div className="account-breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <span>My account</span>
                </div>

                <div className="account-layout">
                    <aside className="account-sidebar" aria-label="Account navigation">
                        <div className="account-identity">
                            <span className="account-avatar" aria-hidden="true">{initials}</span>
                            <div>
                                <span className="account-identity__eyebrow">YOUR ZARIVA</span>
                                <strong>{user?.name || "Welcome"}</strong>
                                <span className="account-identity__email">
                                    {user?.email || "Sign in to access your profile"}
                                </span>
                            </div>
                        </div>

                        <nav className="account-nav" aria-label="My account">
                            {navigationItems.map((item) => (
                                <button
                                    className={`account-nav__item${activeView === item.id ? " is-active" : ""}`}
                                    type="button"
                                    key={item.id}
                                    aria-current={activeView === item.id ? "page" : undefined}
                                    onClick={() => setActiveView(item.id)}
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.count > 0 && <span className="account-nav__count">{item.count}</span>}
                                </button>
                            ))}
                        </nav>

                        {isAuthenticated ? (
                            <button
                                className="account-signout"
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                                {isLoggingOut ? "Signing out..." : "Sign out"}
                            </button>
                        ) : (
                            <button
                                className="account-signout"
                                type="button"
                                onClick={() => navigate("/login", { state: { backgroundLocation: location } })}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">login</span>
                                Sign in
                            </button>
                        )}
                    </aside>

                    <section className="account-main" aria-live="polite">
                        <header className="account-page-heading">
                            <span className="account-kicker">MY ACCOUNT</span>
                            <h1>{viewTitle}</h1>
                            <p>{activeView === "overview"
                                ? isAuthenticated
                                    ? `Welcome back, ${firstName}. Your favourite things, all in one place.`
                                    : "Sign in to see your profile and Zariva Coins. Your wishlist is ready whenever you are."
                                : activeView === "details"
                                    ? "Your profile information, just as you left it."
                                    : "A shortlist of the pieces you love."}</p>
                        </header>

                        {activeView === "overview" && (
                            <>
                                <section className="account-rewards" aria-label="Zariva Coins balance">
                                    <div className="account-rewards__copy">
                                        <span className="account-kicker">A LITTLE SOMETHING EXTRA</span>
                                        <h2>Your Zariva Coins</h2>
                                        <p>Your balance, ready for your next visit.</p>
                                    </div>
                                    <div className="account-rewards__balance">
                                        <span className="material-symbols-outlined" aria-hidden="true">toll</span>
                                        <strong>{isAuthenticated
                                            ? Number(user?.gehna_coins ?? 0).toLocaleString("en-IN")
                                            : "—"}</strong>
                                        <span>coins</span>
                                    </div>
                                    <span className="account-rewards__watermark" aria-hidden="true">Z</span>
                                </section>

                                <div className="account-stats" aria-label="Account summary">
                                    <div className="account-stat">
                                        <span>Saved pieces</span>
                                        <strong>{wishlist.length.toString().padStart(2, "0")}</strong>
                                    </div>
                                    <div className="account-stat">
                                        <span>Coins balance</span>
                                        <strong>{isAuthenticated
                                            ? Number(user?.gehna_coins ?? 0).toLocaleString("en-IN")
                                            : "—"}</strong>
                                    </div>
                                    <div className="account-stat">
                                        <span>Account</span>
                                        <strong className={`account-stat__status${isAuthenticated ? "" : " is-guest"}`}>
                                            <i /> {isAuthenticated ? "Active" : "Guest"}
                                        </strong>
                                    </div>
                                </div>

                                <section className="account-section">
                                    <div className="account-section__heading">
                                        <div>
                                            <span className="account-kicker">THE ESSENTIALS</span>
                                            <h2>Your details</h2>
                                        </div>
                                        <button type="button" onClick={() => setActiveView("details")}>
                                            View details <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                        </button>
                                    </div>
                                    <div className="account-details-grid">
                                        <div><span>Full name</span><strong>{user?.name || (isAuthenticated ? "Not provided" : "Sign in to view")}</strong></div>
                                        <div><span>Email address</span><strong>{user?.email || (isAuthenticated ? "Not provided" : "Sign in to view")}</strong></div>
                                        <div><span>Phone number</span><strong>{user?.phone || (isAuthenticated ? "Not provided" : "Sign in to view")}</strong></div>
                                    </div>
                                </section>

                                <section className="account-section account-section--wishlist">
                                    <div className="account-section__heading">
                                        <div>
                                            <span className="account-kicker">SAVED FOR LATER</span>
                                            <h2>Your wishlist <span>{wishlist.length}</span></h2>
                                        </div>
                                        {wishlist.length > 0 && (
                                            <button type="button" onClick={() => setActiveView("wishlist")}>
                                                See all <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                            </button>
                                        )}
                                    </div>
                                    {wishlist.length > 0 ? (
                                        <div className="account-wishlist-list">
                                            {wishlist.slice(0, 2).map((product) => renderProduct(product, true))}
                                        </div>
                                    ) : (
                                        <div className="account-empty account-empty--inline">
                                            <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
                                            <p>Your saved pieces will find a home here.</p>
                                            <Link to="/">Explore the collection <span aria-hidden="true">↗</span></Link>
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {activeView === "details" && (
                            <section className="account-section account-details-view">
                                <div className="account-section__heading">
                                    <div>
                                        <span className="account-kicker">PROFILE</span>
                                        <h2>Personal information</h2>
                                    </div>
                                </div>
                                <div className="account-details-grid">
                                    <div><span>Full name</span><strong>{user?.name || (isAuthenticated ? "Not provided" : "Sign in to view")}</strong></div>
                                    <div><span>Email address</span><strong>{user?.email || (isAuthenticated ? "Not provided" : "Sign in to view")}</strong></div>
                                    <div><span>Phone number</span><strong>{user?.phone || (isAuthenticated ? "Not provided" : "Sign in to view")}</strong></div>
                                </div>
                                <p className="account-details-note">Need to update your information? Please get in touch with our team.</p>
                                <Link className="account-text-link" to="/">Continue shopping <span aria-hidden="true">↗</span></Link>
                            </section>
                        )}

                        {activeView === "wishlist" && (
                            <section className="account-section account-wishlist-view">
                                <div className="account-section__heading">
                                    <div>
                                        <span className="account-kicker">SAVED FOR LATER</span>
                                        <h2>Your wishlist <span>{wishlist.length}</span></h2>
                                    </div>
                                </div>
                                {wishlist.length > 0 ? (
                                    <div className="account-wishlist-list">
                                        {wishlist.map((product) => renderProduct(product))}
                                    </div>
                                ) : (
                                    <div className="account-empty">
                                        <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
                                        <h3>Nothing saved just yet</h3>
                                        <p>When a piece catches your eye, save it here for later.</p>
                                        <Link to="/">Explore the collection <span aria-hidden="true">↗</span></Link>
                                    </div>
                                )}
                            </section>
                        )}
                    </section>
                </div>

            </div>
        </main>
    );
}

export default Account;