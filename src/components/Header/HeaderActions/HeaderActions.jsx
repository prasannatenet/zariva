import "./HeaderActions.css";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useGetCartQuery, useLogoutMutation } from "../../../store/api/authApi";
import { clearUser } from "../../../store/slices/authSlice";
import { removeWishlistItem, WISHLIST_STORAGE_KEY } from "../../../store/slices/wishlistSlice";
import WishlistDrawer from "../WishlistDrawer/WishlistDrawer";

function HeaderActions() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const accountMenuRef = useRef(null);
    const accountButtonRef = useRef(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    const { user, isAuthenticated } = useSelector(
        (state) => state.auth
    );
    const wishlist = useSelector((state) => state.wishlist);
    const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuthenticated });
    const cart = cartData?.data?.cart ?? cartData?.data ?? cartData;
    const cartCount = Number(cartData?.meta?.count ?? cart?.meta?.count ?? cart?.count ?? 0);

    const [logout, { isLoading: isLoggingOut }] =
        useLogoutMutation();

    useEffect(() => {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    }, [wishlist]);

    const handleAccountClick = () => {
        if (isAuthenticated) {
            setIsAccountMenuOpen((isOpen) => !isOpen);
        } else {
            navigate("/login", {
                state: { backgroundLocation: location },
            });
        }
    };

    useEffect(() => {
        if (!isAccountMenuOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!accountMenuRef.current?.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsAccountMenuOpen(false);
                accountButtonRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isAccountMenuOpen]);

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("gehna_api_token");
            dispatch(clearUser());
            navigate("/login", {
                state: { backgroundLocation: location },
            });
        }
    };

    return (
        <>
            {/* Wishlist */}
            <button
                title="Wishlist"
                type="button"
                aria-label="Wishlist"
                className="header-wishlist"
                aria-expanded={isWishlistOpen}
                aria-controls="wishlist-drawer"
                onClick={() => setIsWishlistOpen(true)}
            >
                <svg
                    width="25"
                    height="26"
                    viewBox="0 0 25 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M15.0002 23.5C18.6668 20.5 24.5001 13.5 24.5002 9.5C24.5002 4.27984 19.0002 1.5 13.5002 6L16.0001 9C14.3335 6.33333 9.80017 1.8 5.00017 5C0.20017 8.2 2.3335 13.3333 4.00017 15.5C5.83349 17.5 9.70012 21.4 10.5001 21"
                        strokeLinecap="round"
                    />
                </svg>
                {wishlist.length > 0 && (
                    <span className="header-wishlist__count" aria-hidden="true">
                        {wishlist.length > 99 ? "99+" : wishlist.length}
                    </span>
                )}
            </button>

            <WishlistDrawer
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
                onRemove={(productKey) => dispatch(removeWishlistItem(productKey))}
            />

            <div className="divider"></div>

            {/* Account */}
            <div className="account-menu" ref={accountMenuRef}>
                <button
                    ref={accountButtonRef}
                    title={isAuthenticated ? user?.name : "My Account"}
                    type="button"
                    aria-label="Account"
                    aria-haspopup={isAuthenticated ? "menu" : undefined}
                    aria-expanded={isAuthenticated ? isAccountMenuOpen : undefined}
                    aria-controls={isAuthenticated ? "account-dropdown" : undefined}
                    className="header-account"
                    onClick={handleAccountClick}
                >
                    <svg
                        width="23"
                        height="23"
                        viewBox="0 0 23 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M11.4998 9.58334C13.6169 9.58334 15.3332 7.8671 15.3332 5.75001C15.3332 3.63291 13.6169 1.91667 11.4998 1.91667C9.38275 1.91667 7.6665 3.63291 7.6665 5.75001C7.6665 7.8671 9.38275 9.58334 11.4998 9.58334Z"
                        />

                        <path
                            d="M19.1644 17.25C19.1668 17.0926 19.1668 16.9328 19.1668 16.7708C19.1668 14.3891 15.7344 12.4583 11.5002 12.4583C7.26598 12.4583 3.8335 14.3891 3.8335 16.7708C3.8335 19.1526 3.8335 21.0833 11.5002 21.0833C13.6382 21.0833 15.18 20.9332 16.2918 20.6649"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>

                {isAuthenticated && isAccountMenuOpen && (
                    <div
                        className="account-dropdown"
                        id="account-dropdown"
                        role="menu"
                        aria-label="Account options"
                    >

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
                        <span className="account-dropdown__greeting">
                            {user?.name ? (
                                <>
                                    Hello, <span className="userName">{user.name}</span>
                                </>
                            ) : "Your Vashu Jewels & Crafts account"}
                        </span>
                        <Link
                            className="account-dropdown__item"
                            role="menuitem"
                            to="/account"
                            onClick={() => setIsAccountMenuOpen(false)}
                        >
                            <span class="material-symbols-outlined">
                                account_circle
                            </span>  My Account
                        </Link>
                        <button
                            className="account-dropdown__item account-dropdown__logout"
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >

                            {isLoggingOut ? "Logging out..." : (
                                <>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        power_settings_new
                                    </span>
                                    Logout
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="divider"></div>

            {/* Cart */}
            <button
                title={cartCount ? `Cart (${cartCount})` : "Cart"}
                type="button"
                aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
                className="header-cart"
                onClick={() => navigate("/cart")}
            >
                <svg
                    width="27"
                    height="28"
                    viewBox="0 0 27 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8.4375 21C9.36948 21 10.125 21.7835 10.125 22.75C10.125 23.7165 9.36948 24.5 8.4375 24.5C7.50552 24.5 6.75 23.7165 6.75 22.75C6.75 21.7835 7.50552 21 8.4375 21Z"
                    />

                    <path
                        d="M18.5625 21.0001C19.4945 21.0001 20.25 21.7835 20.25 22.7501C20.25 23.7166 19.4945 24.5001 18.5625 24.5001C17.6305 24.5001 16.875 23.7166 16.875 22.7501C16.875 21.7835 17.6305 21.0001 18.5625 21.0001Z"
                    />

                    <path
                        d="M2.25 3.5L2.54386 3.60715C4.00815 4.14102 4.7403 4.40797 5.15907 5.04348C5.57784 5.67899 5.57784 6.52314 5.57784 8.21142V11.3867C5.57784 14.8185 5.64899 15.951 6.62369 17.0172C7.59839 18.0833 9.16714 18.0833 12.3047 18.0833H13.5M18.2705 18.0833C20.0266 18.0833 20.9046 18.0833 21.5253 17.5588C22.146 17.0343 22.3233 16.1425 22.6778 14.3587L23.24 11.5299C23.6305 9.50097 23.8257 8.48653 23.3263 7.81326C22.8269 7.14 21.1205 7.14 19.2249 7.14H12.4014M5.57784 7.14H7.875"
                        strokeLinecap="round"
                    />
                </svg>
                {cartCount > 0 && (
                    <span className="header-cart__count" aria-hidden="true">
                        {cartCount > 99 ? "99+" : cartCount}
                    </span>
                )}
            </button>
        </>
    );
}

export default HeaderActions;