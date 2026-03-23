import { setAstrologerDetails } from "../../reducer/registerSlice";
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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;

      dispatch(setAstrologerDetails(data?.data));
    } catch (error) {
      console.error("Failed to store astrologer details:", error);
    }
  },
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
    // GET /api/filters/get-filters/skills - Fetch available skills/expertise options
    getExpertiseList: builder.query({
      query: () => ({
        url: "filters/get-filters/expertise",
        method: "GET",
      }),
    }),
    
  }),
});

export const { useGetAstrologerByIdQuery, useGetTransactionListQuery, useSetAstroEditProfileMutation, useGetExpertiseListQuery } = profileApi;
