import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
    reducerPath: "productApi",
    tagTypes: ["Product"],

    baseQuery: fetchBaseQuery({
        baseUrl: "/api/v1",
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
    }),
});

export const {
    useGetProductsQuery,
    useGetProductQuery,
    useGetRelatedProductsQuery,
    useGetCategoryProductsQuery,
    useGetSearchQuery,
    useGetCombosQuery,
} = productApi;