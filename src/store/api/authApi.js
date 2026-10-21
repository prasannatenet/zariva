import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import BASE_URL from "../../api/config";
import { productApi } from "./productApi";

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,

    prepareHeaders: (headers) => {
        const token = localStorage.getItem("gehna_api_token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const authApi = createApi({
    reducerPath: "authApi",
    tagTypes: ["Cart"],

    baseQuery: async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        // Token invalid / expired
        if (result.error?.status === 401) {
            localStorage.removeItem("gehna_api_token");
        }
        return result;
    },

    endpoints: (builder) => ({
        // LOGIN
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: "/auth/register",
                method: "POST",
                body: userData,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
        }),

        submitProductReview: builder.mutation({
            query: ({ slug, rating, comment, images }) => {
                const formData = new FormData();
                formData.append("rating", rating);
                formData.append("comment", comment);
                images.forEach((image) => formData.append("images[]", image));

                return {
                    url: `/products/${encodeURIComponent(slug)}/reviews`,
                    method: "POST",
                    body: formData,
                };
            },
            onQueryStarted: async ({ slug }, { dispatch, queryFulfilled }) => {
                try {
                    await queryFulfilled;
                    dispatch(productApi.util.invalidateTags([{ type: "Product", id: slug }]));
                } catch {
                    // Keep the current review list when submission fails.
                }
            },
        }),

        addToCart: builder.mutation({
            query: (cartItem) => ({
                url: "/cart",
                method: "POST",
                body: cartItem,
            }),
            invalidatesTags: ["Cart"],
        }),

        updateCartItem: builder.mutation({
            query: ({ cartItemId, quantity }) => ({
                url: `/cart/${encodeURIComponent(cartItemId)}`,
                method: "PATCH",
                body: { quantity },
            }),
            invalidatesTags: ["Cart"],
        }),

        removeCartItem: builder.mutation({
            query: (cartItemId) => ({
                url: `/cart/${encodeURIComponent(cartItemId)}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),

        applyCoupon: builder.mutation({
            query: (couponCode) => ({
                url: "/checkout/apply-coupon",
                method: "POST",
                body: { coupon_code: couponCode },
            }),
        }),

        getCart: builder.query({
            query: () => "/cart",
            providesTags: ["Cart"],
        }),

        getCheckoutSummary: builder.query({
            query: (params = {}) => ({
                url: "/checkout/summary",
                params,
            }),
            providesTags: ["Cart"],
        }),
        placeOrder: builder.mutation({
            query: (order) => ({
                url: "/checkout/place-order",
                method: "POST",
                body: order,
            }),
            invalidatesTags: ["Cart"],
        }),
        verifyRazorpay: builder.mutation({
            query: (payment) => ({
                url: "/checkout/verify-razorpay",
                method: "POST",
                body: payment,
            }),
        }),
        getPaymentStatus: builder.query({
            query: (orderId) => ({
                url: `/checkout/payment-status/${encodeURIComponent(orderId)}`,
                cache: "no-store",
            }),
            keepUnusedDataFor: 0,
        }),

        // CURRENT USER
        getMe: builder.query({
            query: () => "/auth/me",
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useSubmitProductReviewMutation,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveCartItemMutation,
    useApplyCouponMutation,
    useGetCartQuery,
    useGetCheckoutSummaryQuery,
    usePlaceOrderMutation,
    useVerifyRazorpayMutation,
    useLazyGetPaymentStatusQuery,
    useGetMeQuery,
} = authApi;
