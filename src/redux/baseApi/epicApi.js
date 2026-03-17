import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "../../utils/utlis";

export const epicApi = createApi({
  reducerPath: "epicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_APP_API_BASE_URL}/api/`,
    prepareHeaders: (headers) => {
      headers.set("Authorization", `Bearer ${getToken()}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Astrologer", "Availability", "Price", "Transactions"],
  endpoints: () => ({}),
});
