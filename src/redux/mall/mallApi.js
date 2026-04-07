import { epicApi } from "../baseApi/epicApi";

export const mallApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductCategories: builder.query({
      query: () => ({
        url: "mall/product-categories?status=true",
        method: "GET",
      }),
    }),
    getProducts: builder.query({
      query: ({ categoryId, page = 1, limit = 10 }) => ({
        url: `mall/products?status=true&category=${categoryId}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getProductBySlug: builder.query({
      query: (slug) => ({
        url: `mall/products/${slug}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetProductCategoriesQuery, useGetProductsQuery, useLazyGetProductBySlugQuery } = mallApi;
