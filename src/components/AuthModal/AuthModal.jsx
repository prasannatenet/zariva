import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddToCartMutation, useLoginMutation, useRegisterMutation } from "../../store/api/authApi";
import { setUser } from "../../store/slices/authSlice";
import { removeLocalCartItem } from "../../store/slices/cartSlice";
import logo from "../../assets/images/logo.png";
import Button from "../Button/Button";
import "./AuthModal.css";

function AuthModal({ mode }) {
    const isRegister = mode === "register";
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const localCart = useSelector((state) => state.cart);
    const closeDestination = location.state?.backgroundLocation || "/";
    const [login, loginState] = useLoginMutation();
    const [register, registerState] = useRegisterMutation();
    const [addToCart] = useAddToCartMutation();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });
    const [validationMessage, setValidationMessage] = useState("");
    const activeRequest = isRegister ? registerState : loginState;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                navigate(closeDestination);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeDestination, navigate]);

    const updateField = (event) => {
        setForm((currentForm) => ({
            ...currentForm,
            [event.target.name]: event.target.value,
        }));
        setValidationMessage("");
    };

    const switchMode = () => {
        navigate(isRegister ? "/login" : "/register", {
            state: { backgroundLocation: closeDestination },
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setValidationMessage("");

        if (isRegister && form.password !== form.password_confirmation) {
            setValidationMessage("Your passwords do not match.");
            return;
        }

        let response;
        try {
            response = isRegister
                ? await register(form).unwrap()
                : await login({ email: form.email, password: form.password }).unwrap();
        } catch {
            setValidationMessage(
                activeRequest.error?.data?.message ||
                    (isRegister
                        ? "We couldn't create your account. Please check your details."
                        : "We couldn't sign you in. Check your email and password."),
            );
            return;
        }

        const { token, user } = response.data;
        localStorage.setItem("gehna_api_token", token);
        dispatch(setUser(user));

        for (const item of localCart) {
            try {
                await addToCart({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    ...(item.combo_id != null ? { combo_id: item.combo_id } : {}),
                }).unwrap();
                dispatch(removeLocalCartItem(item.id));
            } catch (error) {
                setValidationMessage(
                    error.data?.message || "You're signed in, but we couldn't sync your saved cart. Submit again to retry.",
                );
                return;
            }
        }

        navigate(closeDestination);
    };

    return (
        <div
            className="auth-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    navigate(closeDestination);
                }
            }}
        >
            <section
                className={`auth-dialog${isRegister ? " auth-dialog-register" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-title"
            >
                <button
                    className="auth-close"
                    type="button"
                    aria-label="Close dialog"
                    onClick={() => navigate(closeDestination)}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                </button>

                <aside className="auth-artwork" aria-label="Vashu Jewels & Crafts fine jewellery">
                    <div className="auth-artwork-copy">
                        <span className="auth-eyebrow">MADE TO BE YOURS</span>
                        <p>For the moments<br />that become yours.</p>
                        <span className="auth-artwork-rule" />
                    </div>
                    <span className="auth-artwork-caption">VASHU JEWELS &amp; CRAFTS</span>
                </aside>

                <div className="auth-content">
                    <div className="auth-brand">
                        <img src={logo} alt="Vashu Jewels & Crafts" />
                    </div>

                    <div className="auth-heading">
                        <span className="auth-eyebrow">
                            {isRegister ? "A LITTLE MORE YOU" : "WELCOME BACK"}
                        </span>
                        <h1 id="auth-title">
                            {isRegister ? "Create your account" : "Sign in to Vashu Jewels & Crafts"}
                        </h1>
                        <p>
                            {isRegister
                                ? "Join us and find pieces that feel like you."
                                : "Your favourites are right where you left them."}
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="auth-field">
                                <label htmlFor="auth-name">Full name</label>
                                <input
                                    autoComplete="name"
                                    id="auth-name"
                                    name="name"
                                    onChange={updateField}
                                    placeholder="Your name"
                                    required
                                    value={form.name}
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label htmlFor="auth-email">Email address</label>
                            <input
                                autoComplete="email"
                                id="auth-email"
                                name="email"
                                onChange={updateField}
                                placeholder="you@example.com"
                                required
                                type="email"
                                value={form.email}
                            />
                        </div>

                        {isRegister && (
                            <div className="auth-field">
                                <label htmlFor="auth-phone">Phone number</label>
                                <input
                                    autoComplete="tel"
                                    id="auth-phone"
                                    name="phone"
                                    onChange={updateField}
                                    placeholder="Your phone number"
                                    required
                                    type="tel"
                                    value={form.phone}
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label htmlFor="auth-password">Password</label>
                            <input
                                autoComplete={isRegister ? "new-password" : "current-password"}
                                id="auth-password"
                                name="password"
                                onChange={updateField}
                                placeholder={isRegister ? "Create a password" : "Your password"}
                                required
                                type="password"
                                value={form.password}
                            />
                        </div>

                        {isRegister && (
                            <div className="auth-field">
                                <label htmlFor="auth-password-confirmation">Confirm password</label>
                                <input
                                    autoComplete="new-password"
                                    id="auth-password-confirmation"
                                    name="password_confirmation"
                                    onChange={updateField}
                                    placeholder="Enter it once more"
                                    required
                                    type="password"
                                    value={form.password_confirmation}
                                />
                            </div>
                        )}

                        {(validationMessage || activeRequest.error) && (
                            <p className="auth-error" role="alert">
                                {validationMessage || "Something went wrong. Please try again."}
                            </p>
                        )}

                        <Button
                            className="auth-submit"
                            disabled={activeRequest.isLoading}
                            fullWidth
                            materialIcon={!activeRequest.isLoading ? "north_east" : undefined}
                            text={activeRequest.isLoading
                                ? isRegister ? "Creating account..." : "Signing in..."
                                : isRegister ? "Create account" : "Sign in"}
                            type="submit"
                        />
                    </form>

                    <p className="auth-switch">
                        {isRegister ? "Already have an account?" : "New to Vashu Jewels & Crafts?"}
                        <button type="button" onClick={switchMode}>
                            {isRegister ? "Sign in" : "Create an account"}
                        </button>
                    </p>
                    <p className="auth-footnote">A considered piece. A lifetime of moments.</p>
                </div>
            </section>
        </div>
    );
}

export default AuthModal;