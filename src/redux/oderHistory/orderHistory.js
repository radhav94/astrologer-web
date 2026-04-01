import { epicApi } from "../baseApi/epicApi";

export const orderHistory = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderHistory: builder.query({
      query: ({ page = 1, limit = 10, sortBy, filterBy, search, dateRange, customFromDate, customToDate } = {}) => ({
        url: "transactions/allAstroTransactions",
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

    // Refund initiation API - POST /api/transactions/refundIniitalByAstrologer
    refundInitiateByAstrologer: builder.mutation({
      query: ({ astrologerId, minutes, roomId, userId }) => ({
        url: "transactions/refundIniitalByAstrologer",
        method: "POST",
        body: { astrologerId, minutes, roomId, userId },
      }),
      invalidatesTags: ["Transactions"],
    }),

    // GET /api/astrologers/withdrawalHistory — fetch withdrawal requests
    getWithdrawalHistory: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "astrologers/withdrawRequest",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Withdrawals"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrderHistoryQuery,
  useRefundInitiateByAstrologerMutation,
  useGetWithdrawalHistoryQuery,
} = orderHistory;
