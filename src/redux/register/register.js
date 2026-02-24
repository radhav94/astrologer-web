import { createApi } from "@reduxjs/toolkit/query/react";
import { epicApi } from "../baseApi/epicApi"

export const registerAstroApi = createApi({
    reducerPath: "registerAstroApi",
    baseQuery: epicApi,
    // tagTypes: [""],
    endpoints: (builder) => ({
        registerAstrologer: builder.mutation({
            query: (body) => ({
                url: "astrologers/registerAstrologer",
                method: "POST",
                body,
            }),
            // invalidatesTags: ["Login"],
        }),
    }),
});

export const { useRegisterAstroApi } = registerAstroApi;