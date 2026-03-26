import { privateApi } from "../../services/appServices/privateRequest";

export const reviewApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    addUserReview: builder.mutation({
      query: ({ userID, rating, review, isAnonymous, roomId }) => ({
        url: "review/addCustomerReview",
        method: "POST",
        body: {
          userID,
          rating,
          review,
          isAnonymous,
          roomId
        },
      }),
    })
  }),
});

export const { useAddUserReviewMutation } = reviewApi;
