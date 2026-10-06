import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryApi = createApi({
    reducerPath: "categoryApi",

    baseQuery: fetchBaseQuery({
        baseUrl: "/api/v1",
    }),

    endpoints: (builder) => ({
        getCategories: builder.query({
            query: (parentId = "root") => ({
                url: "/categories",
                params: { parent_id: parentId },
            }),
        }),
    }),
});

export const {
    useGetCategoriesQuery,
} = categoryApi;