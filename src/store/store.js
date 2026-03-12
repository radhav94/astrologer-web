import { configureStore } from "@reduxjs/toolkit";
import { vedicApi } from "../redux/baseApi/vedicApi";
import { privateApi } from "../services/appServices/privateRequest";
import { epicApi } from "../redux/baseApi/epicApi";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import { combineReducers } from "@reduxjs/toolkit";

// Slice import
import registerReducer from "../reducer/registerSlice";
 

// Persist configuration - ONLY for register slice
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["register"], // ONLY persist register slice
};


// Combine all reducers
const rootReducer = combineReducers({
  register: registerReducer, // This will be persisted
  [vedicApi.reducerPath]: vedicApi.reducer,
  [privateApi.reducerPath]: privateApi.reducer,
  [epicApi.reducerPath]: epicApi.reducer,
});


// Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
     serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      // Include all middlewares here
      .concat(vedicApi.middleware)
      .concat(privateApi.middleware)
      .concat(epicApi.middleware),
});


export const persistor = persistStore(store);