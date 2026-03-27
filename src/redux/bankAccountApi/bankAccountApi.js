import { privateApi } from "../../services/appServices/privateRequest";

export const bankAccountApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all bank accounts
    getBankAccounts: builder.query({
      query: (status = "active") => ({
        url: `astrologer-bank/bank-accounts`,
        method: "GET",
        params: { status },
      }),
      providesTags: ["BankAccounts"],
    }),

    // POST add new bank account
    addBankAccount: builder.mutation({
      query: (body) => ({
        url: "astrologer-bank",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BankAccounts"],
    }),

    // PUT update bank account
    updateBankAccount: builder.mutation({
      query: ({ bankAccId, ...body }) => ({
        url: `astrologer-bank/bank-account?bankAccId=${bankAccId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["BankAccounts"],
    }),

    // PUT deactivate bank account
    deactivateBankAccount: builder.mutation({
      query: (bankAccId) => ({
        url: `astrologer-bank/deactivate-bank-account?bankAccId=${bankAccId}`,
        method: "PUT",
      }),
      invalidatesTags: ["BankAccounts"],
    }),

    // PUT activate bank account
    activateBankAccount: builder.mutation({
      query: ({ accountId, activate }) => ({
        url: "astrologer-bank/activate-bank-account",
        method: "PUT",
        body: { accountId, activate },
      }),
      invalidatesTags: ["BankAccounts"],
    }),
  }),
});

export const {
  useGetBankAccountsQuery,
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeactivateBankAccountMutation,
  useActivateBankAccountMutation,
} = bankAccountApi;
