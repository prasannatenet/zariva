import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import BASE_URL from "../../api/config";

export const productApi = createApi({
    reducerPath: "productApi",
    tagTypes: ["Product"],

    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),

    endpoints: (builder) => ({
        getProducts: builder.query({
            query: (params = {}) => ({
                url: "/products",
                params,
            }),
        }),

        getProduct: builder.query({
            query: (slug) => `/products/${slug}`,
            providesTags: (_result, _error, slug) => [{ type: "Product", id: slug }],
        }),

        getRelatedProducts: builder.query({
            query: (slug) => `/products/${slug}/related?per_page=3`,
        }),

        getCategoryProducts: builder.query({
            query: ({ slug, per_page = 7 }) => ({
                url: `/categories/${slug}/products`,
                params: { per_page },
            }),
        }),

        getSearch: builder.query({
            query: ({ q, ...params }) => ({
                url: "/search",
                params: { ...params, q },
            }),
        }),

        getCombos: builder.query({
            query: () => "/combos",
        }),

        getCoupons: builder.query({
            query: () => "/coupons",
        }),

        getSettings: builder.query({
            query: () => "/settings",
        }),

        getHomeData: builder.query({
            query: () => "/home",
        }),

        getSliders: builder.query({
            query: () => "/sliders",
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductQuery,
    useGetRelatedProductsQuery,
    useGetCategoryProductsQuery,
    useGetSearchQuery,
    useGetCombosQuery,
    useGetCouponsQuery,
    useGetSettingsQuery,
    useGetHomeDataQuery,
    useGetSlidersQuery,
} = productApi;