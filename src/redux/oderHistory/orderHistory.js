import { epicApi } from "../baseApi/epicApi";

export const orderHistory = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderHistory: builder.query({
      query: ({ page = 1, limit = 10, sortOrder, filterBy } = {}) => ({
        url: "transactions/allAstroTransactions",
        method: "GET",
        params: {
          page,
          limit,
          ...(sortOrder && { sortOrder }),
          ...(filterBy && { filterBy }),
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetOrderHistoryQuery } = orderHistory;
