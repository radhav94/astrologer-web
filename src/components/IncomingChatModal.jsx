
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/chatContext";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { PATH } from "../utils/routes/Paths";
import { useEffect, useState } from "react";
import toast from "./toast";

const IncomingChatModal = () => {
  const { incomingChat, setIncomingChat, setActiveChat } = useChat();
  const navigate = useNavigate();
  const astroIdLocal = localStorage.getItem("shubhtalk_astro_id");
  const [isAccepting, setIsAccepting] = useState(false);

  // Listen for chat accept errors and success from server
  useEffect(() => {
    const handleChatAcceptError = (data) => {
      // Only handle errors that match our chat roomId
      // This prevents cross-contamination with call errors on the same socket
      if (!data.roomId || (incomingChat && data.roomId !== incomingChat.roomId)) {
        return; // Not our error — ignore
      }

      console.error("Chat accept error:", data);
      
      if (data.code === "ALREADY_ACCEPTED") {
        toast.error(data.message || "This chat has already been accepted from another device.");
      } else {
        toast.error(data.message || "Failed to accept chat");
      }
      
      setIncomingChat(null);
      setIsAccepting(false);
    };

    const handleChatAcceptSuccess = (data) => {
      console.log("Chat accepted successfully:", data);
      
      // Only set active chat and navigate when server confirms success
      if (incomingChat) {
        setActiveChat({
          roomId: incomingChat.roomId,
          isUserSide: false,
          chaterType: incomingChat.chaterType,
          chaterName: incomingChat.chaterName,
          chaterId: incomingChat?.chaterrId,
          astrologerId: astroIdLocal,
          userID: incomingChat?.userID
        });

        navigate(
          PATH.privateRoutes.CHAT_WINDOW.path.replace(
            ":chatId",
            incomingChat?.chaterrId
          ),
          {
            state: {
              userId: incomingChat?.chaterrId,
              astrologerId: astroIdLocal,
              fullName: incomingChat?.chaterName,
              roomId: incomingChat?.roomId,
              isUserSide: false,
              kundliId: null,
              userID: incomingChat?.userID
            },
          }
        );

        setIncomingChat(null);
        setIsAccepting(false);
      }
    };

    voiceSocket.on("chat:accept:error", handleChatAcceptError);
    voiceSocket.on("error", handleChatAcceptError);
    voiceSocket.on("chat:accepted", handleChatAcceptSuccess);

    return () => {
      voiceSocket.off("chat:accept:error", handleChatAcceptError);
      voiceSocket.off("error", handleChatAcceptError);
      voiceSocket.off("chat:accepted", handleChatAcceptSuccess);
    };
  }, [setIncomingChat, incomingChat, setActiveChat, navigate, astroIdLocal]);

  if (!incomingChat) return null;

  const acceptChat = () => {
    if (isAccepting) return; // Prevent multiple clicks
    setIsAccepting(true);

    try {
      voiceSocket.emit("chat:accept", {
        roomId: incomingChat.roomId,
        token: incomingChat.agoraToken,
        channelName: incomingChat.roomId,
        acceptedBy: "ASTROLOGER"
      });

      // Don't set active chat or navigate here - wait for server confirmation
      // The useEffect will handle setting activeChat and navigation on success
    } catch (error) {
      console.error("Error accepting chat:", error);
      toast.error(error?.message || "Failed to accept chat");
      setIsAccepting(false);
    }
  };

  const rejectChat = () => {
    voiceSocket.emit("chat:reject", {
      roomId: incomingChat.roomId,
      rejectedBy: "ASTROLOGER"
    });
    setIncomingChat(null);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Popup */}
      <div className="pointer-events-auto mb-6 w-[90%] max-w-md animate-slideUp rounded-2xl bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md">
        
        {/* Title */}
        <div className="mb-4 flex items-center gap-3">
          <div className="text-3xl">
            ✉️
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Incoming Chat 
            </h3>
            <p className="text-sm text-zinc-400">
              {incomingChat?.chaterName || "Someone"} wants to chat with you…
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-4">
          <button
            onClick={rejectChat}
            className="flex-1 rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 active:scale-95 transition"
          >
            Reject
          </button>

          <button
            onClick={acceptChat}
            disabled={isAccepting}
            className={`flex-1 rounded-xl py-3 text-white font-semibold transition ${
              isAccepting 
                ? "bg-green-600/50 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 active:scale-95"
            }`}
          >
            {isAccepting ? "Accepting..." : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingChatModal;
