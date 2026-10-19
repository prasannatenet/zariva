import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import SiteMetaSync from "./components/SiteMetaSync/SiteMetaSync";

const Home = lazy(() => import("./components/pages/Home/Home"));
const Login = lazy(() => import("./components/pages/Login/Login"));
const Register = lazy(() => import("./components/pages/Register/Register"));
const Account = lazy(() => import("./components/pages/Account/Account"));
const ProductDetail = lazy(() => import("./components/pages/ProductDetail/ProductDetail"));
const Checkout = lazy(() => import("./components/pages/Checkout/Checkout"));
const Cart = lazy(() => import("./components/pages/Cart/Cart"));
const CategoryListing = lazy(() => import("./components/pages/CategoryListing/CategoryListing"));

function RouteFallback() {
    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
            }}
            role="status"
            aria-live="polite"
        >
            <span className="loading__spinner" aria-hidden="true" />
            <span>Loading...</span>
        </div>
    );
}


function AppRoutes() {
    const location = useLocation();
    const isAuthRoute = ["/login", "/register"].includes(location.pathname);
    const backgroundLocation = location.state?.backgroundLocation ||
        (isAuthRoute ? { pathname: "/", search: "", hash: "" } : location);

    return (
        <Suspense fallback={<RouteFallback />}>
            <Routes location={backgroundLocation}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/:slug" element={<CategoryListing />} />
                </Route>
            </Routes>
            {isAuthRoute && (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            )}
        </Suspense>
    );
}

function App() {
    return (
        <BrowserRouter>
            <SiteMetaSync />
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;