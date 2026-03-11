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
      providesTags: (result, error, id) => [
        { type: "Astrologer", id },
        "Availability",
        "Price",
      ],
    }),

    getMonthlyOverview: builder.query({
      query: ({ month, year } = {}) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        if (year) params.append("year", year);
        
        const queryString = params.toString();
        return {
          url: `astrologers/monthly-overview${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["MonthlyOverview"],
    }),
  }),
});

export const { 
  useUpdateAvailabilityMutation, 
  useSetAstrologerPriceMutation, 
  useGetAstrologerByIdQuery,
  useGetMonthlyOverviewQuery 
} = astrologerApi;
