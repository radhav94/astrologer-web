import { epicApi } from "../baseApi/epicApi";

/**
 * Homepage API endpoints
 * Manages homepage section configuration and content
 */
export const homepageApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches homepage sections configuration
     * @param {string} slug - The page slug (default: "astrologerLandingPage")
     * @returns {Object} Homepage sections data with display order and status
     */
    getHomepageSections: builder.query({
      query: (slug = "astrologerLandingPage") => ({
        url: `homepage/?slug=${slug}`,
        method: "GET",
      }),
      providesTags: ["Homepage"],
      // Cache for 5 minutes to reduce API calls
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetHomepageSectionsQuery } = homepageApi;
