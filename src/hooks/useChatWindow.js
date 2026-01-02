import { useEffect, useState } from "react";
import socketService from "../services/appServices/socketService";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import toast from "../components/toast";
import {useChat as useChatContext} from "../context/chatContext"

export default function useChat({
  userId,
  astrologerId,
  roomId,
  isUserSide,
  kundliId,
  setOpenReview
}) {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isMessageDisabled, setIsMessageDisabled] = useState(false);
  const {setActiveChat} = useChatContext();

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    if(!roomId || !userId || !astrologerId) return;
    socketService.connect({
      onConnected: () => {
        // socketService.joinRoom({ roomId, userId, astrologerId });
      },
      onError: (errMsg) => {
        toast.error(errMsg ||"Something went wrong");
        setError(errMsg)
      },
    });

    const handleAddMessage = (data) => {
      const isSenderAstrologer = data.sender === "astrologer";

        addMessage({
          text: data.message,
          sender: isSenderAstrologer,
          time: formatTime(),
          dateTime: data?.dateTime
        });
    }

    const handleChatEnd = () => {
      toast.warning("Chat has ended");
      setIsMessageDisabled(true);
      setActiveChat(null);
      setOpenReview(true);
    }

    voiceSocket.on("message:recieved", handleAddMessage);
    voiceSocket.on("chat:ended", handleChatEnd);

    return () => {
    voiceSocket.off("message:recieved", handleAddMessage);
    voiceSocket.on("chat:ended", handleChatEnd);
    }
  }, [roomId]);

  // ASTRO SEND
  const astroReply = (text) => {
    const res = socketService.astrologerReplied({
      message: text,
      roomId,
      userId,
      astrologerId,
      sender: "astrologer",
      kundliId,
      type: "message"
    });

    if (res?.error) {
      setError(res.error);
      return;
    }
  };

  //  typing emit
  const sendTyping = () => {
    socketService.sendTyping({ roomId, sender: userId });
  };

  return {
    messages,
    error,
    isTyping,
    // sendMessage,
    astroReply,
    sendTyping,
    isMessageDisabled,
    setIsMessageDisabled
  };
}
