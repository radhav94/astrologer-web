import { epicApi } from "../baseApi/epicApi";

export const supportApi = epicApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportTopics: builder.query({
      query: () => ({
        url: "support/topics?role=astrologer",
        method: "GET",
      }),
    }),
    getTopicDetail: builder.query({
      query: (topicId) => ({
        url: `support/topics/${topicId}`,
        method: "GET",
      }),
    }),
    getEntities: builder.query({
      query: ({ entityType, page = 1, limit = 20 }) => ({
        url: `support/entities/${entityType}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    createSupportTicket: builder.mutation({
      query: (body) => ({
        url: "support/tickets",
        method: "POST",
        body,
      }),
    }),
    getMyTickets: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `support/tickets/my?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getTicketDetail: builder.query({
      query: (ticketId) => ({
        url: `support/tickets/${ticketId}`,
        method: "GET",
      }),
    }),
    sendTicketMessage: builder.mutation({
      query: ({ ticketId, message }) => ({
        url: `support/tickets/${ticketId}/message`,
        method: "POST",
        body: { message },
      }),
    }),
  }),
});

export const {
  useGetSupportTopicsQuery,
  useLazyGetTopicDetailQuery,
  useLazyGetEntitiesQuery,
  useCreateSupportTicketMutation,
  useLazyGetMyTicketsQuery,
  useGetTicketDetailQuery,
  useSendTicketMessageMutation,
} = supportApi;
