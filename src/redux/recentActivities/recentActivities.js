
import { epicApi } from "../baseApi/epicApi";

export const recentActivitiesApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecentAstrologerActivities: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `astrologers/recentActivites?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetRecentAstrologerActivitiesQuery,
} = recentActivitiesApi;
