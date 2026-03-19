import { useEffect, useState } from "react";
import socketService from "../services/appServices/socketService";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import toast from "../components/toast";
import {useChat as useChatContext} from "../context/chatContext"
import { useCall } from "../context/CallContext";
import { useNavigate } from "react-router-dom";
import { showErrorWithHighlight } from "../utils/showErrorWithHighlight";

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
  const { activeCall } = useCall();
  const navigate = useNavigate();

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Helper to check if this chat/call is currently active
  const isChatOrCallActive = () => {
    const activeChatUserId = activeChat?.userId || activeChat?.chaterId;
    const isInActiveChat = activeChatUserId === userId || activeChat?.roomId === roomId;
    const isInActiveCall = activeCall?.userId === userId;
    return isInActiveChat || isInActiveCall;
  };

  // Clear messages when chat/call ends
  useEffect(() => {
    // If neither chat nor call is active for this user, clear local messages
    if (!isChatOrCallActive()) {
      setMessages([]);
    }
  }, [activeChat, activeCall]);

  const handleChatEndedFromServer = () => {
    setIsMessageDisabled(true);
    setOpenReview(true);
    stopTimer();
    setActiveChat(null);
    setMessages([]); // Clear local messages — they're now in history
    
    // Clean up reconnect flags
    if (roomId) {
      localStorage.removeItem(`shubhtalk_chat_init_${roomId}`);
    }
    localStorage.removeItem("shubhtalk_chat_start_time");
  };

  // Derive disabled state from activeChat / activeCall
  useEffect(() => {
    if (isChatOrCallActive()) {
      setIsMessageDisabled(false);
    } else {
      setIsMessageDisabled(true);
    }
  }, [activeChat, activeCall, userId, roomId]);

  // Socket connection & listeners — separate effect, runs once per roomId
  useEffect(() => {
    if(!roomId || !userId || !astrologerId) return;

    // Check if this is a reconnected session (init flag already set)
    const initFlagKey = `shubhtalk_chat_init_${roomId}`;
    const isReconnectedSession = localStorage.getItem(initFlagKey) === "true";

    socketService.connect({
      onConnected: () => {
        console.log("[useChatWindow] Socket connected for room:", roomId);
        if(Object.keys(activeChat || {}).length > 0 || (activeCall && activeCall.userId === userId)) {
          startTimer();
          setIsMessageDisabled(false);
          
          // Set chat start time only if not already set (preserves original on reconnect)
          const startTimeKey = "shubhtalk_chat_start_time";
          if (!localStorage.getItem(startTimeKey)) {
            localStorage.setItem(startTimeKey, Date.now().toString());
          }
          
          // Mark this room as initialized (for reconnect detection)
          if (!isReconnectedSession) {
            localStorage.setItem(initFlagKey, "true");
          }
        }
      },
      onDisconnected: (reason) => {
        console.log("[useChatWindow] Socket disconnected:", reason);
      },
      onError: (errMsg) => {
        showErrorWithHighlight(errMsg);
        // toast.error(errMsg ||"Something went wrong");
        setError(errMsg)
        if(errMsg === 'Chat no longer available' || errMsg === 'Chat has already ended' || errMsg === 'Session not found'){
          setIsMessageDisabled(true);
          stopTimer();
          setActiveChat(null);
          navigate("/chats");
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
          dateTime: data?.dateTime,
          type: data?.type,
          kundliName: data?.kundliName
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
  }, [roomId]);

  // ASTRO SEND
  const astroReply = (text, type = "message") => {
    const res = socketService.astrologerReplied({
      message: text,
      roomId,
      userId,
      astrologerId,
      sender: "astrologer",
      kundliId,
      type: type
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
    chatSeconds,
    remainingTime: activeChat?.remainingTime || 0,
    handleChatEndedFromServer
  };
}
