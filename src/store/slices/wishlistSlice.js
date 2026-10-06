import { createSlice } from "@reduxjs/toolkit";

export const WISHLIST_STORAGE_KEY = "zariva_wishlist";

const readWishlist = () => {
    try {
        const savedWishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]");
        return Array.isArray(savedWishlist) ? savedWishlist : [];
    } catch {
        return [];
    }
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: readWishlist,
    reducers: {
        toggleWishlistItem: (state, action) => {
            const product = action.payload;
            const productKey = String(product.id ?? product.slug);
            const existingIndex = state.findIndex(
                (item) => String(item.id ?? item.slug) === productKey
            );

            if (existingIndex >= 0) {
                state.splice(existingIndex, 1);
            } else {
                state.push(product);
            }
        },
        removeWishlistItem: (state, action) => state.filter(
            (item) => String(item.id ?? item.slug) !== String(action.payload)
        ),
    },
});

export const { toggleWishlistItem, removeWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;