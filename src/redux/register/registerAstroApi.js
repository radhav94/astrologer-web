import { epicApi } from "../baseApi/epicApi";

export const registerAstroApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    registerAstrologer: builder.mutation({
      query: (body) => ({
        url: "astrologers/registerAstrologer",
        method: "POST",
        body,
      }),
    }),
    // GET /api/filters/get-filters/skills - Fetch available skills/expertise options
    getExpertiseList: builder.query({
      query: () => ({
        url: "filters/get-filters/expertise",
        method: "GET",
      }),
    }),
    // GET /api/filters/get-filters/specialities
    getSpecialitiesList: builder.query({
      query: () => ({
        url: "filters/get-filters/specialities",
        method: "GET",
      }),
    }),
  }),
});

export const { useRegisterAstrologerMutation, useGetExpertiseListQuery, useGetSpecialitiesListQuery } = registerAstroApi;
