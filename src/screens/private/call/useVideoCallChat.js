import { useEffect, useState } from "react";
import socketService from "../../../../src/services/appServices/socketService";
import { voiceSocket } from "../../../../src/services/appServices/voiceSocketServices";
import Toast from "../../../../src/components/toast";

export const useVideoCallChat = ({ userId, astrologerId, roomId, kundliId, isActive }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  // const [isTyping, setIsTyping] = useState(false);

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    if (!roomId || !userId || !astrologerId || !isActive) return;

    socketService.connect({
      onConnected: () => {
        console.log("Video call chat connected");
      },
      onError: (errMsg) => {
        Toast.error(errMsg || "Something went wrong");
        setError(errMsg);
      },
      onWarn: (msg) => {
        Toast.warning(msg || "Something went wrong");
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
        kundliId: data?.kundliId,
        kundliName: data?.kundliName,
      });
    };

    // const handleTyping = (data) => {
    //   if (data.sender !== userId) {
    //     setIsTyping(true);
    //     setTimeout(() => setIsTyping(false), 3000);
    //   }
    // };

    const handleWarning = (msg) => {
      Toast.warning(msg.message);
    };

    voiceSocket.on("message:recieved", handleAddMessage);
    // voiceSocket.on("typing", handleTyping);
    voiceSocket.on("warning", handleWarning);

    return () => {
      voiceSocket.off("message:recieved", handleAddMessage);
      // voiceSocket.off("typing", handleTyping);
      voiceSocket.off("warning", handleWarning);
    };
  }, [roomId, userId, astrologerId, isActive]);

 
  const sendMessage = (text, type = "message") => {
    const res = socketService.astrologerReplied({
      roomId,
      userId,
      astrologerId,
      kundliId,
      message: text,
      type
    });

    if (res?.error) {
      setError(res.error);
      Toast.error(res.error);
      return;
    }
  };

  // const sendTyping = () => {
  //   socketService.sendTyping({ roomId, sender: userId });
  // };

  return {
    messages,
    error,
    // isTyping,
    sendMessage,
    // sendTyping,
  };
};