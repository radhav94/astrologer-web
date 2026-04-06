import { useMatch, useNavigate } from "react-router-dom";
import { useChat } from "../context/chatContext";
import { PATH } from "../utils/routes/Paths";

const StickyChatFooter = () => {
  const { activeChat, chatSeconds } = useChat();
  const navigate = useNavigate();

  // Hide on chat window page
  const onChatWindowPage = useMatch("/chat/:chatId");

  // Don't show if no active chat, already on chat window page, or inside an iframe (e.g. Kundli view)
  if (!activeChat || onChatWindowPage || window.self !== window.top) return null;

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleOpenChat = () => {
    const chatId = activeChat.chaterId || activeChat.userId;
    if (chatId) {
      navigate(
        PATH.privateRoutes.CHAT_WINDOW.path.replace(":chatId", chatId),
        {
          state: {
            userId: chatId,
            astrologerId: localStorage.getItem("shubhtalk_astro_id"),
            fullName: activeChat.chaterName || "Customer",
            roomId: activeChat.roomId,
            isUserSide: false,
            kundliId: null,
            userID: activeChat.userID
          },
        }
      );
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slideUp w-[90%] max-w-md md:max-w-lg">
      <div className="flex items-center gap-3 md:gap-4 rounded-2xl bg-zinc-900/95 px-4 py-3 md:px-5 md:py-4 shadow-2xl backdrop-blur-md border border-zinc-800">
        <div className="flex items-center gap-2 md:gap-3 text-white flex-1 min-w-0">
          <span className="text-lg md:text-xl flex-shrink-0">💬</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium truncate">Chat ongoing</p>
            <p className="text-[10px] md:text-xs text-zinc-400 truncate">
              With {activeChat.chaterName || "Customer"} • {formatTime(chatSeconds)}
            </p>
          </div>
          <button
            onClick={handleOpenChat}
            className="ml-2 md:ml-3 rounded-lg md:rounded-xl bg-gradient-to-r from-[#F75801] to-[#D43400] px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white hover:from-[#E54E00] hover:to-[#C32F00] active:scale-95 transition-all shadow-lg whitespace-nowrap flex-shrink-0"
          >
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyChatFooter;
