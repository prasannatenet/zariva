
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { store } from "./store/store.js";
import AuthInitializer from "./components/Auth/AuthInitializer.jsx";


import "./styles/variables.css";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <AuthInitializer>
                <App />
            </AuthInitializer>
        </Provider>
    </StrictMode>
);