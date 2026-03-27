import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "../../utils/utlis";

export const epicApi = createApi({
  reducerPath: "epicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_APP_API_BASE_URL}/api/`,
    prepareHeaders: (headers) => {
      const role = localStorage.getItem("shubhtalk_role");
      const token =
        role === "ASTROLOGER"
          ? localStorage.getItem("shubhtalk_astro_token")
          : localStorage.getItem("shubhtalk_customer_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Astrologer", "Availability", "Price", "Transactions"],
  endpoints: () => ({}),
});
