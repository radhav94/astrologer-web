import { setAstrologerDetails } from "../../reducer/registerSlice";
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
        url: `astrologers/astrologer?astrologerId=${id}&change=false`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Astrologer", id },
        "Astrologer",
        "Availability",
        "Price",
      ],
      // Invalidate Wallets tag so wallet data refetches when astrologer data is fetched
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store astrologer details in Redux
          dispatch(setAstrologerDetails(data?.data));
          // After astrologer data is fetched, invalidate Wallets to trigger refetch
          dispatch(epicApi.util.invalidateTags(["Wallets"]));
        } catch {
          // Silently ignore — non-critical
        }
      },
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

    // Wallet endpoint — moved from redux/wallet/walletApi.js
    getAllWallets: builder.query({
      query: () => ({
        url: "wallets/all",
        method: "GET",
      }),
      providesTags: ["Wallets"],
    }),
  }),
});

export const { 
  useUpdateAvailabilityMutation, 
  useSetAstrologerPriceMutation, 
  useGetAstrologerByIdQuery,
  useGetMonthlyOverviewQuery,
  useGetAllWalletsQuery,
} = astrologerApi;
