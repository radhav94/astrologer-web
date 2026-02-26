import privateRequest from "./privateRequest";

/**
 * Fetch monthly overview data for astrologer
 * @param {Object} params - Query parameters
 * @param {number} params.month - Month number (1-12)
 * @param {number} params.year - Year (YYYY)
 * @returns {Promise} API response with monthly overview data
 */
export const getMonthlyOverview = async ({ month, year } = {}) => {
  try {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    
    const queryString = params.toString();
    const url = `astrologers/monthly-overview${queryString ? `?${queryString}` : ""}`;
    
    return await privateRequest.get(url);
  } catch (error) {
    console.error("Get monthly overview failed:", error?.response?.data || error.message);
    return {
      data: {
        success: false,
        message: "Failed to fetch monthly overview",
      },
    };
  }
};
