import { configureStore } from "@reduxjs/toolkit";
import { vedicApi } from "../redux/baseApi/vedicApi";
import { privateApi } from "../services/appServices/privateRequest";

export const store = configureStore({
  reducer: {
    [vedicApi.reducerPath]: vedicApi.reducer,
    [privateApi.reducerPath]: privateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      //   serializableCheck: false,
    })
      // Include all middlewares here
      .concat(vedicApi.middleware)
      .concat(privateApi.middleware),
});
