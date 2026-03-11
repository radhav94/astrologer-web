import { epicApi } from "../baseApi/epicApi";

export const profileApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAstrologerById: builder.query({
      query: ({ id }) => ({
        url: `astrologers/astrologer?astrologerId=${id}`,
        method: "GET",
      }),
      providesTags: (result, error, { id }) => [
        { type: "Astrologer", id },
      ],
    }),
    getTransactionList: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "transactions/all",
        method: "GET",
        params: { page, limit },
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

export const { useGetAstrologerByIdQuery, useGetTransactionListQuery,useSetAstroEditProfileMutation } = profileApi;
