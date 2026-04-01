import { epicApi } from "../baseApi/epicApi";

export const kycApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    generateAadhaarOtp: builder.mutation({
      query: ({ aadhaar_number, name, dob }) => {
        const body = new FormData();
        body.append("aadhaar_number", aadhaar_number);
        body.append("consent", "y");
        body.append("reason", "For KYC");
        body.append("name", name);
        body.append("dob", dob);
        return {
          url: "kyc/generate-otp",
          method: "POST",
          body,
          // Let the browser set Content-Type with the correct multipart boundary
          headers: { "Content-Type": undefined },
        };
      },
    }),
    verifyAadhaarOtp: builder.mutation({
      query: ({ kyc_record_id, otp }) => ({
        url: "kyc/aadhaar/verify-otp",
        method: "POST",
        body: { kyc_record_id, otp },
      }),
    }),
    verifyPan: builder.mutation({
      query: ({ pan, name, dob }) => {
        const body = new FormData();
        body.append("pan", pan);
        body.append("name", name);
        body.append("dob", dob);
        body.append("consent", "Y");
        body.append("reason", "For onboarding customers");
        return {
          url: "kyc/pan/verify",
          method: "POST",
          body,
          // Let the browser set Content-Type with the correct multipart boundary
          headers: { "Content-Type": undefined },
        };
      },
    }),
  }),
});

export const {
  useGenerateAadhaarOtpMutation,
  useVerifyAadhaarOtpMutation,
  useVerifyPanMutation,
} = kycApi;
