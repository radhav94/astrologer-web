import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { voiceSocket } from "../services/appServices/voiceSocketServices";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState(null);

  // ✅ GLOBAL waiting list
  const [waitingList, setWaitingList] = useState([]);

  // ✅ GLOBAL incoming call
  const [incomingCall, setIncomingCall] = useState(null);





useEffect(() => {
  const astrologerId = localStorage.getItem("shubhtalk_astro_id");
  if (!astrologerId) {
    console.log("❌ astrologerId not found in localStorage");
    return;
  }

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
      astrologerId,
      role: "ASTROLOGER",
    };
    voiceSocket.connect();
    console.log("🔄 socket.connect() called");
  }

  // 📞 EVENTS
  const handleIncomingCall = (data) => {
    console.log("GLOBAL incoming call", data);
    setIncomingCall({
      roomId: data.roomId,
      agoraToken: data.agoraToken,
      callerId: data.callerId,
      callType: data.type || "audio",
      callerName:data?.callerDetail?.firstName
    });
  };

  const handleCallCanceled = () => {
    console.log("🚫 Call canceled");
    setIncomingCall(null);
  };

  const handleWaitingList = (data) => {
    console.log("Waiting list update", data);
    setWaitingList(data?.list || []);
  };

  voiceSocket.on("incoming_call", handleIncomingCall);
  voiceSocket.on("call_canceled", handleCallCanceled);
  voiceSocket.on("waiting_list", handleWaitingList);

  return () => {
    voiceSocket.off("connect", onConnect);
    voiceSocket.off("disconnect", onDisconnect);
    voiceSocket.off("connect_error", onConnectError);

    voiceSocket.off("incoming_call", handleIncomingCall);
    voiceSocket.off("call_canceled", handleCallCanceled);
    voiceSocket.off("waiting_list", handleWaitingList);
  };
}, []);


  return (
    <CallContext.Provider
      value={{
        activeCall,
        setActiveCall,
        waitingList,
        setWaitingList,
        incomingCall,
        setIncomingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
