import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import BASE_URL from "../../api/config";

export const categoryApi = createApi({
    reducerPath: "categoryApi",

    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
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