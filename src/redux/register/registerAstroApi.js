import { epicApi } from "../baseApi/epicApi";

export const registerAstroApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    registerAstrologer: builder.mutation({
      query: (body) => ({
        url: "astrologers/registerAstrologer",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRegisterAstrologerMutation } = registerAstroApi;
