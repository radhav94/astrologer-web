import React from "react";
import { Link, useNavigate } from "react-router";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Icons } from "../../../components/Icons";
import { useGetChatMessagesQuery } from "../../../redux/activity/chatApi";
import { PATH } from "../../../utils/routes/Paths";
import { useChat } from "../../../context/chatContext";

dayjs.extend(relativeTime);

const mapRecentActivity = (apiData = []) => {
  return apiData
    .map((item) => {
      const latestMessage = item?.latestMessage;
      const user = item?.userDetail;

      // Handle gift message preview
      let messagePreview = latestMessage?.message || "";
      if (latestMessage?.type === "gift") {
        try {
          const parsed = typeof messagePreview === "string" ? JSON.parse(messagePreview) : messagePreview;
            messagePreview = "🎁 Sent a gift";
        } catch (e) {
          messagePreview = "🎁 Sent a gift";
        }
      }

      return {
        id: item?._id,
        userId: user?._id,
        type: "chat",

        title:
          user?.firstName || user?.lastName
            ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
            : user?.phoneNumber || "Unknown User",

        subtitle:
          latestMessage?.sender === "astrologer"
            ? "Astrologer replied"
            : "You sent a message",

        timeAgo: latestMessage?.updatedAt
          ? dayjs(latestMessage.updatedAt).fromNow()
          : "",

        messagePreview: messagePreview,

        avatarSeed: user?._id,

        lastMessageTime: latestMessage?.updatedAt || null,

        userID: user?.user_ID
      };
    })
    .sort(
      (a, b) =>
        dayjs(b.lastMessageTime).valueOf() -
        dayjs(a.lastMessageTime).valueOf()
    );
};


const ChatPage = ({ onBack }) => {
  const astroIdLocal = localStorage.getItem("shubhtalk_astro_id");
  
  const { data, isLoading, isError, refetch } = useGetChatMessagesQuery({
    astrologerId: astroIdLocal,
  }, {refetchOnMountOrArgChange : true});
  const navigate = useNavigate();
  const { activeChat } = useChat();
  const activityList = mapRecentActivity(data?.data);

  {isLoading && (
    <div className="text-center text-gray-400 py-4">
        Loading messages...
    </div>
    )}

    {isError && (   
    <div className="text-center text-red-500 py-4">
        Failed to load messages.
        <button
        onClick={refetch}
        className="ml-2 underline text-sm"
        >
        Retry
        </button>
    </div>
    )}

  return (
    <div className="h-full flex flex-col text-start ">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Link to="/dashboard">
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Client Chats</h1>
      </div>

      <div className="space-y-6 pb-20">
        <div>
          {/* <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            20/11/2025
          </h3> */}
          <div className="space-y-3">
            {activityList.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                navigate(
                  PATH.privateRoutes.CHAT_WINDOW.path.replace(
                    ":chatId",
                    item?.id
                  ),
                  {
                    state: {
                      userId: item?.userId,
                      astrologerId: astroIdLocal,
                      fullName: item?.title,
                      roomId: activeChat?.chaterId === item.id ? activeChat?.roomId : null,
                      isUserSide: false,
                      kundliId:null,
                      userID: item?.userID
                    },
                  }
                )
              }
                className={`rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all
                            ${
                              activeChat?.chaterId === item.id
                                ? "bg-blue-100 ring-2 ring-blue-400"
                                : "bg-[#EAEAEA] hover:bg-gray-200"
                            }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0">
                    <img
                      className="rounded-full"
                      src={`https://picsum.photos/seed/${item.avatarSeed}/200`}
                      alt={item.title}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {item.title}
                    </p>
                    <p className="text-gray-600 text-xs line-clamp-1">
                      {item.messagePreview}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {item.timeAgo}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
