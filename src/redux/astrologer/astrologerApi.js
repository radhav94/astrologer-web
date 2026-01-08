import { epicApi } from "../baseApi/epicApi";

export const astrologerApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    updateAvailability: builder.mutation({
      query: (availabilityPayload) => ({
        url: "astrologers/availability",
        method: "PUT",
        body: availabilityPayload,
      }),
      invalidatesTags: ["Availability"],
    }),

    setAstrologerPrice: builder.mutation({
      query: (pricePayload) => ({
        url: "astrologers/price",
        method: "PUT",
        body: pricePayload,
      }),
      invalidatesTags: ["Price"],
    }),

    getAstrologerById: builder.query({
      query: (id) => ({
        url: `astrologers/astrologer?astrologerId=${id}`,
        method: "GET",
      }),
    })
  }),
});

export const { useUpdateAvailabilityMutation, useSetAstrologerPriceMutation, useGetAstrologerByIdQuery } =
  astrologerApi;
