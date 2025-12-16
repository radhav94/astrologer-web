import { configureStore } from "@reduxjs/toolkit";
import { vedicApi } from "../redux/baseApi/vedicApi";

export const store = configureStore({
  reducer: {
    [vedicApi.reducerPath]: vedicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      //   serializableCheck: false,
    })
      // Include all middlewares here
      .concat(vedicApi.middleware),
});
