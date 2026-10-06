import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    isAuthLoading: true,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isAuthLoading = false;
        },

        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAuthLoading = false;
        },

        finishAuthLoading: (state) => {
            state.isAuthLoading = false;
        },
    },
});

export const {
    setUser,
    clearUser,
    finishAuthLoading,
} = authSlice.actions;

export default authSlice.reducer;