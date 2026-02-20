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
        "Availability",
        "Price",
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
  }),
});

export const { useGetAstrologerByIdQuery, useGetTransactionListQuery } = profileApi;
