import { vedicApi } from "../baseApi/vedicApi";

export const kundliVedicApi = vedicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAstroDetails: builder.query({
      query: (params) => ({
        url: "extended-horoscope/extended-kundli-details",
        params: {
          dob: params?.dob || "11/11/1999",
          tob: params?.tob || "08:09",
          lat: params?.lat || 18.9581934,
          lon: params?.lon || 72.8320729,
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
          dob: params?.dob || "11/11/1999",
          tob: params?.tob || "08:09",
          tz: params?.tz || 5.5,
          div: chartType,
          style: params?.style || "north",
          lang: "en",
          stroke: 2,
          lat: params?.lat || 18.9581934,
          lon: params?.lon || 72.8320729,
          color: "%23ff850b3d",
          font_size: 15,
          font_style: "Nunito",
          colorful_planets: true,
          format: "svg", //  IMPORTANT (use svg not base64)
          transit_date: "22/01/2022",
          size: 300,
          show_degree: true,
        },
      }),
    }),

    getMahaDashaPredictions: builder.query({
      query: (params) => ({
        url: "dashas/maha-dasha-predictions",
        params: {
          dob: params?.dob || "11/11/1999",
          tob: params?.tob || "08:09",
          lat: params?.lat || 18.9581934,
          lon: params?.lon || 72.8320729,
          tz: params?.tz || 5.5,
          lang: "en",
        },
      }),
    }),

    getPlanets: builder.query({
      query: (params) => ({
        url: "horoscope/planet-details",
        params: {
          dob: params.dob,
          tob: params.tob,
          lat: params.lat,
          lon: params.lon,
          tz: params.tz || 5.5,
          lang: "en",
        },
      }),
    }),
  }),
});

export const {
  useGetAstroDetailsQuery,
  useGetChartQuery,
  useGetPlanetsQuery,
  useGetMahaDashaPredictionsQuery,
} = kundliVedicApi;
