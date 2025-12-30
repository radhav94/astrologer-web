import { privateApi } from "../services/appServices/privateRequest";

export const s3SignedApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    getS3SignedUrl: builder.mutation({
      query: ({ fileType }) => ({
        url: "getUploadUrl?fileType="+encodeURI(fileType),
        method: "GET"
      }),
    })
  }),
});

export const { useGetS3SignedUrlMutation } = s3SignedApi;
