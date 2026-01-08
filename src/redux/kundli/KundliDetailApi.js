import { epicApi } from "../baseApi/epicApi.js";
import { vedicApi } from "../baseApi/vedicApi";

// -------------------- Kundli Epic API --------------------
export const kundliEpicApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Kundli by kundliId
    getKundliById: builder.query({
      query: (kundliId) => ({
        url: "/kundlis/kundli",
        params: { kundliId },
        headers: {
          accept: "application/json",
        },
      }),
    }),
  }),
});

export const { useGetKundliByIdQuery } = kundliEpicApi;

// -------------------- Kundli Base API --------------------
export const kundliApi = vedicApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchBirthDetails: builder.query({
      query: ({ payload }) => ({
        url: "birth_details",
        method: "POST",
        body: payload,
      }),
    }),

    getBasicPanchang: builder.query({
      query: ({ payload }) => ({
        url: "basic_panchang",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useFetchBirthDetailsQuery, useGetBasicPanchangQuery } = kundliApi;

// -------------------- Kundli Vedic API --------------------
export const kundliVedicApi = vedicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAstroDetails: builder.query({
      query: (params) => ({
        url: "extended-horoscope/extended-kundli-details",
        params: {
          dob: params?.dob,
          tob: params?.tob,
          lat: params?.lat,
          lon: params?.lon,
          tz: params?.tz || 5.5,
          lang: "en",
        },
      }),
    }),

    getChart: builder.query({
      query: ({ chartType, params }) => ({
        url: "horoscope/chart-image",
        method: "GET",
        params: {
          dob: params?.dob,
          tob: params?.tob,
          tz: params?.tz || 5.5,
          div: chartType,
          style: params?.style || "north",
          lang: "en",
          stroke: 2,
          lat: params?.lat,
          lon: params?.lon,
          color: "%23ff850b3d",
          font_size: 15,
          font_style: "Nunito",
          colorful_planets: true,
          format: "svg", // return SVG
          transit_date: "22/01/2022",
          size: 300,
          show_degree: true,
        },
        responseHandler: "text",
      }),
      transformResponse: (responseText) => responseText, // return raw SVG
    }),

    getAshtakvargaChart: builder.query({
      query: ({ chartType, params }) => ({
        url: "horoscope/ashtakvarga-chart-image",
        method: "GET",
        params: {
          dob: params?.dob,
          tob: params?.tob,
          lat: params?.lat,
          lon: params?.lon,
          tz: params?.tz || 5.5,
          style: params?.style || "north",
          color: "%23ff850b3d",
          planet: chartType,
          size: 300,
          font_size: 15,
          lang: "en",
          format: "svg",
        },
        responseHandler: "text",
      }),
      transformResponse: (responseText) => responseText,
    }),

    getPlanets: builder.query({
      query: (params) => ({
        url: "horoscope/planet-details",
        params: {
          dob: params?.dob,
          tob: params?.tob,
          lat: params?.lat,
          lon: params?.lon,
          tz: params?.tz || 5.5,
          lang: "en",
        },
      }),
    }),

    getKpDetails: builder.query({
      query: (params) => ({
        url: "extended-horoscope/kp-planets",
        params: {
          dob: params?.dob,
          tob: params?.tob,
          lat: params?.lat,
          lon: params?.lon,
          tz: params?.tz || 5.5,
          lang: "en",
        },
      }),
    }),

    getAi12MonthsPrediction: builder.query({
      query: (params) => ({
        url: "horoscope/ai-12-month-prediction",
        params: {
          dob: params?.dob,
          tob: params?.tob,
          lat: params?.lat,
          lon: params?.lon,
          tz: params?.tz || 5.5,
          lang: "en",
        },
      }),
    }),
  }),
});

export const {
  useGetAstroDetailsQuery,
  useGetChartQuery,
  useGetAshtakvargaChartQuery,
  useGetPlanetsQuery,
  useGetKpDetailsQuery,
  useGetAi12MonthsPredictionQuery,
} = kundliVedicApi;
