import { useMatch, useNavigate } from "react-router-dom";
import { useChat } from "../context/chatContext";
import { PATH } from "../utils/routes/Paths";

const StickyChatFooter = () => {
  const { activeChat, chatSeconds } = useChat();
  const navigate = useNavigate();

  // Hide on chat window page
  const onChatWindowPage = useMatch("/chat/:chatId");

  // Don't show if no active chat or already on chat window page
  if (!activeChat || onChatWindowPage) return null;

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
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slideUp">
      <div className="flex items-center gap-4 rounded-2xl bg-zinc-900/95 px-5 py-4 shadow-2xl backdrop-blur-md border border-zinc-800">
        <div className="flex items-center gap-3 text-white">
          <span className="text-xl">💬</span>
          <div>
            <p className="text-sm font-medium">Chat ongoing</p>
            <p className="text-xs text-zinc-400">
              With {activeChat.chaterName || "Customer"} • {formatTime(chatSeconds)}
            </p>
          </div>
          <button
            onClick={handleOpenChat}
            className="ml-3 rounded-xl bg-gradient-to-r from-[#F75801] to-[#D43400] px-4 py-2 text-sm font-semibold text-white hover:from-[#E54E00] hover:to-[#C32F00] active:scale-95 transition-all shadow-lg"
          >
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyChatFooter;
