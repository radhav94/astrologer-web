import { epicApi } from "../baseApi/epicApi";

export const transactionsApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "transactions/all",
        method: "GET",
        params: { page, limit },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTransactionsQuery,
} = transactionsApi;
