import { createSlice } from "@reduxjs/toolkit";

export const CART_STORAGE_KEY = "zariva_cart";

const readCart = () => {
    try {
        const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
        return Array.isArray(savedCart) ? savedCart : [];
    } catch {
        return [];
    }
};

const getItemKey = (item) => String(item.combo_id ?? item.product_id ?? item.id);

const cartSlice = createSlice({
    name: "cart",
    initialState: readCart,
    reducers: {
        addLocalCartItem: (state, action) => {
            const { product, quantity = 1, combo } = action.payload;
            const comboId = combo?.id;
            const productId = product.id ?? product.product_id ?? product.slug;
            const key = String(comboId ?? productId ?? product.slug);
            const existingItem = state.find((item) => getItemKey(item) === key);

            if (existingItem) {
                existingItem.quantity += quantity;
                existingItem.line_total = Number(existingItem.price) * existingItem.quantity;
                return;
            }

            const price = Number(combo?.combo_price ?? product.price) || 0;
            const itemId = `guest-${key}`;
            state.push({
                id: itemId,
                cart_item_id: itemId,
                product_id: productId,
                combo_id: comboId,
                type: combo ? "combo" : "product",
                product,
                ...(combo ? { combo } : {}),
                name: combo?.name ?? product.name,
                price,
                quantity,
                line_total: price * quantity,
                stock_quantity: product.stock_quantity ?? product.stock ?? null,
                in_stock: product.in_stock,
            });
        },
        updateLocalCartItem: (state, action) => {
            const item = state.find((entry) => String(entry.id) === String(action.payload.id));
            if (!item) return;

            item.quantity = action.payload.quantity;
            item.line_total = Number(item.price) * item.quantity;
        },
        removeLocalCartItem: (state, action) => state.filter(
            (item) => String(item.id) !== String(action.payload)
        ),
    },
});

export const { addLocalCartItem, updateLocalCartItem, removeLocalCartItem } = cartSlice.actions;
export default cartSlice.reducer;
