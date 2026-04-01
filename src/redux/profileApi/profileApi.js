import { epicApi } from "../baseApi/epicApi";

export const profileApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionList: builder.query({
      query: ({ page = 1, limit = 10, sortBy, filterBy, search, dateRange, customFromDate, customToDate } = {}) => ({
        url: "transactions/all",
        method: "GET",
        params: {
          page,
          limit,
          ...(sortBy && { sortBy }),
          ...(filterBy && { filterBy }),
          ...(search && { search }),
          ...(dateRange && { dateRange }),
          ...(customFromDate && { customFromDate }),
          ...(customToDate && { customToDate }),
        },
      }),
      providesTags: ["Transactions"],
    }),
    setAstroEditProfile: builder.mutation({
      query: ({ id, ...body }) => ({
        url: "astrologers/editProfileData",
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => 
        id ? [{ type: "Astrologer", id }] : ["Astrologer"],
    }),
    
    
  }),
});

export const { useGetTransactionListQuery, useSetAstroEditProfileMutation } = profileApi;
