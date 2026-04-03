import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vedicApi = createApi({
  reducerPath: "vedicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_VEDIC_API_BASE_URL}/`,
  }),
  endpoints: () => ({}),
});
