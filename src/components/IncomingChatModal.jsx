
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/chatContext";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { PATH } from "../utils/routes/Paths";
import { useEffect } from "react";

const IncomingChatModal = () => {
  const { incomingChat, setIncomingChat, setActiveChat, activeChat } = useChat();
  const navigate = useNavigate();
  const astroIdLocal = localStorage.getItem("shubhtalk_astro_id");

  //   useEffect(() => {
  //     const handleChatUserAccepted = (data) => {
  //       console.log("useraccept list update", data);
  //       const {astrologerId, roomId, userId} = data
  //       setActiveChat({
  //             roomId: roomId,
  //             isUserSide: false,
  //             chaterName:incomingChat.chaterName,
  //             chaterId : userId
  //           });
        
  //           navigate(
  //                   PATH.privateRoutes.CHAT_WINDOW.path.replace(
  //                     ":chatId",
  //                     userId
  //                   ),
  //                   {
  //                     state: {
  //                       userId: userId,
  //                       astrologerId: astrologerId,
  //                       fullName: "Customer",
  //                       roomId: roomId,
  //                       isUserSide: false,
  //                       kundliId:null
  //                     },
  //                   }
  //                 )
  //     };

  //     voiceSocket.on("chat:accepted", handleChatUserAccepted);

  //     return () => {
  //     voiceSocket.off("chat:accepted", handleChatUserAccepted);
  //     }
  // }, [])

  if (!incomingChat) return null;

  const acceptChat = () => {
    voiceSocket.emit("chat:accept", {
      roomId: incomingChat.roomId,
      token: incomingChat.agoraToken,
      channelName: incomingChat.roomId,
      acceptedBy : "ASTROLOGER"
    });

    setActiveChat({
      roomId: incomingChat.roomId,
      isUserSide: false,
      chaterType: incomingChat.chaterType,
      chaterName:incomingChat.chaterName,
      chaterId : incomingChat?.chaterId
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
                kundliId:null
              },
            }
          )

    setIncomingChat(null);
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
            className="flex-1 rounded-xl bg-green-600 py-3 text-white font-semibold hover:bg-green-700 active:scale-95 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingChatModal;
