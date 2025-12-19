import { configureStore } from "@reduxjs/toolkit";
import { vedicApi } from "../redux/baseApi/vedicApi";
import { privateApi } from "../services/appServices/privateRequest";
import { epicApi } from "../redux/baseApi/epicApi";

export const store = configureStore({
  reducer: {
    [vedicApi.reducerPath]: vedicApi.reducer,
    [privateApi.reducerPath]: privateApi.reducer,
    [epicApi.reducerPath]: epicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      //   serializableCheck: false,
    })
      // Include all middlewares here
      .concat(vedicApi.middleware)
      .concat(privateApi.middleware)
      .concat(epicApi.middleware),
});
