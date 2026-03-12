import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { useCall } from "./CallContext";
import toast from "../components/toast";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const {astroId} = useCall();
  const [activeChat, setActiveChat] = useState(null);

  // ✅ GLOBAL waiting list
  const [waitingList, setWaitingList] = useState([]);

  // ✅ GLOBAL incoming call
  const [incomingChat, setIncomingChat] = useState(null);
  const [chatSeconds, setChatSeconds] = useState(0);
  const [chatStartTime, setChatStartTime] = useState(null);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) return;
    if (!chatStartTime) setChatStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setChatSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const resetTimer = () => {
    stopTimer();
    setChatSeconds(0);
    setChatStartTime(null);
  };


useEffect(() => {
  if (!astroId) {
    if (voiceSocket.connected) voiceSocket.disconnect();
    return;
  }
  if (voiceSocket.connected) {
      voiceSocket.disconnect();
    }

    voiceSocket.io.opts.query = {
      astrologerId: astroId,
      role: "ASTROLOGER",
    };

    console.log("🔄 Connecting socket with:", voiceSocket.io.opts.query);
    voiceSocket.connect();

  // 🔍 SOCKET DEBUG LISTENERS
  const onConnect = () => {
    console.log("🟢 SOCKET CONNECTED");
    console.log("Socket ID:", voiceSocket.id);
    console.log("Connected:", voiceSocket.connected);
  };

  const onDisconnect = (reason) => {
    console.log("🔴 SOCKET DISCONNECTED:", reason);
  };

  const onConnectError = (err) => {
    console.log("❌ SOCKET CONNECT ERROR:", err.message);
  };

  voiceSocket.on("connect", onConnect);
  voiceSocket.on("disconnect", onDisconnect);
  voiceSocket.on("connect_error", onConnectError);

  // 🔌 CONNECT SOCKET
  if (!voiceSocket.connected) {
    voiceSocket.io.opts.query = {
      astrologerId: astroId,
      role: "ASTROLOGER",
    };
    voiceSocket.connect();
    console.log("🔄 socket.connect() called");
  }

  // 📞 EVENTS
  const handleIncomingChat = (data) => {
    if(data.type != "chat") return;
    
    // Handle null/undefined firstName and lastName
    const firstName = data?.user?.firstName?.trim() || "";
    const lastName = data?.user?.lastName?.trim() || "";
    const chaterName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || lastName || "Customer";
    
    setIncomingChat({
      roomId: data.roomId,
      chaterrId: data.user?._id,
      chaterType: data.type || "chat",
      chaterName: chaterName,
      userID: data?.user?.user_ID
    });
  };

  const handleChatCanceled = (data) => {
    console.log("🚫 Call canceled", data);
    setIncomingChat(null);
    toast.warning(data?.message || "User has cancelled chat request!")
  };

  const handleWaitingList = (data) => {
    console.log("Waiting list update", data);
    setWaitingList(data?.list || []);
  };

  // const handleActivity = (data) => {
  //   if(data?.remainingTime){
  //     resetTimer(); // Reset the timer
  //     setChatSeconds(data?.remainingTime*60); // Use data.remainingTime if provided
  //     startTimer(); // Start the timer again
  //   }
  // }

  // voiceSocket.on("activity", handleActivity);
  voiceSocket.on("incoming", handleIncomingChat);
  voiceSocket.on("chat:canceled", handleChatCanceled);
  voiceSocket.on("waiting_list", handleWaitingList);
  voiceSocket.on("message:recieved", handleWaitingList);

  return () => {
    voiceSocket.off("connect", onConnect);
    voiceSocket.off("disconnect", onDisconnect);
    voiceSocket.off("connect_error", onConnectError);

    // voiceSocket.off("activity", handleActivity);
    voiceSocket.off("incoming", handleIncomingChat);
    voiceSocket.off("chat:canceled", handleChatCanceled);
    voiceSocket.off("waiting_list", handleWaitingList);
  };
}, [astroId]);


  return (
    <ChatContext.Provider
      value={{
        activeChat,
        setActiveChat,
        waitingList,
        setWaitingList,
        incomingChat,
        setIncomingChat,
        startTimer,
        stopTimer,
        resetTimer,
        chatSeconds,
        setChatSeconds,
        chatStartTime
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
