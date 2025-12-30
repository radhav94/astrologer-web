import { epicApi } from "../baseApi/epicApi";

export const profileApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAstrologerById: builder.query({
      query: ({ id }) => ({
        url: `astrologers/astrologer?astrologerId=${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {} = profileApi;
