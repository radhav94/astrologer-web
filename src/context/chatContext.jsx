import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { useCall } from "./CallContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const {astroId} = useCall();
  const [activeChat, setActiveChat] = useState(null);

  // ✅ GLOBAL waiting list
  const [waitingList, setWaitingList] = useState([]);

  // ✅ GLOBAL incoming call
  const [incomingChat, setIncomingChat] = useState(null);


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
    console.log("GLOBAL incoming call", data);

    setIncomingChat({
      roomId: data.roomId,
      chaterrId: data.user?._id,
      chaterType: data.type || "chat",
      chaterName:data?.user?.firstName
    });
  };

  const handleChatCanceled = () => {
    console.log("🚫 Call canceled");
    setIncomingChat(null);
  };

  const handleWaitingList = (data) => {
    console.log("Waiting list update", data);
    setWaitingList(data?.list || []);
  };

  voiceSocket.on("incoming", handleIncomingChat);
  voiceSocket.on("chat:canceled", handleChatCanceled);
  voiceSocket.on("waiting_list", handleWaitingList);
  voiceSocket.on("message:recieved", handleWaitingList);

  return () => {
    voiceSocket.off("connect", onConnect);
    voiceSocket.off("disconnect", onDisconnect);
    voiceSocket.off("connect_error", onConnectError);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
