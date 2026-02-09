import { useEffect, useState } from "react";
import socketService from "../services/appServices/socketService";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import toast from "../components/toast";
import {useChat as useChatContext} from "../context/chatContext"
import { formatTimer } from "../utils/timeFormat";

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
  const {setActiveChat, activeChat, startTimer, stopTimer, chatSeconds} = useChatContext();

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleChatEndedFromServer = () => {
    setIsMessageDisabled(true);
    setOpenReview(true);
    stopTimer();
    setActiveChat(null);
  };

  useEffect(() => {
    if(activeChat?.astrologerId !== astrologerId) setIsMessageDisabled(true);
    if(!roomId || !userId || !astrologerId) return;
    socketService.connect({
      onConnected: () => {
        // socketService.joinRoom({ roomId, userId, astrologerId });
        if(Object.keys(activeChat || {}).length > 0 ) {
          startTimer();
          setIsMessageDisabled(false);
        }
      },
      onError: (errMsg) => {
        toast.error(errMsg ||"Something went wrong");
        setError(errMsg)
        if(errMsg === 'Chat no longer available' || errMsg === 'Chat has already ended' || errMsg === 'Session not found'){
          setIsMessageDisabled(true);
          stopTimer();
          setActiveChat(null);
        }
      },
      onWarn: (msg) => {
        toast.warning(msg ||"Something went wrong");
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

    const handleWarning = (msg) => {
      toast.warning(msg?.message || "Warning msg");
    }

    const handleTyping = (isTyping) => {
      console.log('Typing event received:', isTyping);
      setIsTyping(isTyping === true);
    }

    voiceSocket.on("message:recieved", handleAddMessage);
    voiceSocket.on("warning", handleWarning);
    voiceSocket.on("typing", handleTyping);
    voiceSocket.on("chat:ended", handleChatEndedFromServer);

    return () => {
      voiceSocket.off("message:recieved", handleAddMessage);
      voiceSocket.off("warning", handleWarning);
      voiceSocket.off("typing", handleTyping);
      voiceSocket.off("chat:ended", handleChatEndedFromServer);
    }
  }, [roomId, activeChat]);

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
    setIsMessageDisabled,
    formattedTime: formatTimer(chatSeconds),
    chatSeconds,
    remainingTime: activeChat?.remainingTime || 0,
    handleChatEndedFromServer
  };
}
