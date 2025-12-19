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
        url: "chat/messages",
        params: { astrologerId },
      }),
    }),

    getChatHistory: builder.query({
      query: ({ roomId }) => ({
        url: "chat/messages",
        params: { roomId },
      }),
    }),
  }),
});

export const { useGetChatMessagesQuery, useCreateChatRoomMutation ,useGetChatHistoryQuery} = chatApi;
