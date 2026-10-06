import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./components/pages/Home/Home";
import Login from "./components/pages/Login/Login";
import Register from "./components/pages/Register/Register";
import Account from "./components/pages/Account/Account";
import ProductDetail from "./components/pages/ProductDetail/ProductDetail"
import Checkout from "./components/pages/Checkout/Checkout";
import Cart from "./components/pages/Cart/Cart";
import CategoryListing from "./components/pages/CategoryListing/CategoryListing";


function AppRoutes() {
    const location = useLocation();
    const isAuthRoute = ["/login", "/register"].includes(location.pathname);
    const backgroundLocation = location.state?.backgroundLocation ||
        (isAuthRoute ? { pathname: "/", search: "", hash: "" } : location);

    return (
        <>
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
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;