import { epicApi } from "../baseApi/epicApi";

export const milestoneApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMilestones: builder.query({
      query: () => ({
        url: "milestone/getAllMilestones",
        method: "GET",
      }),
      providesTags: ["Milestones"],
    }),
  }),
});

export const { useGetAllMilestonesQuery } = milestoneApi;
