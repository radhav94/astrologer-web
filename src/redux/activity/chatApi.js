import { privateApi } from "../../services/appServices/privateRequest";


export const chatApi = privateApi.injectEndpoints({
  endpoints: (builder) => ({
    createChatRoom: builder.mutation({
      query: ({ userId, astrologerId }) => ({
        url: "chat/room/create",
        method: "POST",
        body: {
          userId,
          astrologerId,
        },
      }),
    }),

    getChatMessages: builder.query({
      query: ({ astrologerId }) => ({
        url: "chat/messages/inbox",
        params: { astrologerId },
      }),
    }),

    getChatHistory: builder.query({
      query: ({ userId }) => ({
        url: `chat/messages/inbox/${userId}`,
      }),
    }),
  }),
});

export const { useGetChatMessagesQuery, useCreateChatRoomMutation ,useGetChatHistoryQuery} = chatApi;
