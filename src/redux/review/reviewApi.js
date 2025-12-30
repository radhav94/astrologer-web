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
          isAnonymous
        },
      }),
    })
  }),
});

export const { useAddUserReviewMutation } = reviewApi;
