import { privateApi } from "../services/appServices/privateRequest";

export const s3SignedApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    getS3SignedUrl: builder.mutation({
      query: ({ fileType, fileName }) => {
        let url = "getUploadUrl?fileType=" + encodeURI(fileType);
        if (fileName) {
          url += "&fileName=" + encodeURIComponent(fileName);
        }
        return {
          url,
          method: "GET"
        };
      },
    })
  }),
});

export const { useGetS3SignedUrlMutation } = s3SignedApi;
