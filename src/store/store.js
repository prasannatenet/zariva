import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "./api/productApi";
import { categoryApi } from "./api/categoryApi";
import { authApi } from "./api/authApi";
import authReducer from "./slices/authSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
    reducer: {
        [productApi.reducerPath]: productApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,

        auth: authReducer,
        wishlist: wishlistReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(productApi.middleware)
            .concat(authApi.middleware)
            .concat(categoryApi.middleware),
});