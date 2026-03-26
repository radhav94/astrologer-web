import { privateApi } from "../../services/appServices/privateRequest";

export const reviewApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    addUserReview: builder.mutation({
      query: ({ userID, rating, review, isAnonymous }) => ({
        url: "review/addCustomerReview",
        method: "POST",
        body: {
          userID,
          rating,
          review,
          isAnonymous,
        },
      }),
    }),

    // GET /api/report/reasons — fetch report categories for ReportCaller
    getReportReasons: builder.query({
      query: () => ({
        url: "report/reasons",
        method: "GET",
      }),
    }),

    // POST /api/report/submit — submit a report against a caller
    submitReport: builder.mutation({
      query: ({ reasonId, userId, astrologerId, description }) => ({
        url: "report/submit",
        method: "POST",
        body: { reasonId, userId, description },
      }),
    }),
  }),
});

export const {
  useAddUserReviewMutation,
  useGetReportReasonsQuery,
  useSubmitReportMutation,
} = reviewApi;
