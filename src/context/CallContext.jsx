import React, { createContext, useContext, useEffect, useState } from "react";
import { voiceSocket } from "../services/appServices/voiceSocketServices";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [astroId, setAstroId] = useState(
    () => localStorage.getItem("shubhtalk_astro_id")
  );

  const [activeCall, setActiveCall] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);

  /* 🔥 Listen to login/logout changes */
  useEffect(() => {
    const syncAstroId = () => {
      setAstroId(localStorage.getItem("shubhtalk_astro_id"));
    };

    window.addEventListener("storage", syncAstroId);
    return () => window.removeEventListener("storage", syncAstroId);
  }, []);

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

    const onConnect = () =>
      console.log("🟢 SOCKET CONNECTED:", voiceSocket.id);

    const onDisconnect = (r) =>
      console.log("SOCKET DISCONNECTED:", r);

    const onConnectError = (e) =>
      console.log("CONNECT ERROR:", e.message);

    const handleIncomingCall = (data) => {
      console.log("Incoming call:", data);
      setIncomingCall({
        roomId: data.roomId,
        agoraToken: data.agoraToken,
        callerId: data.callerId,
        callType: data.type || "audio",
        callerName: data?.callerDetail?.firstName,
      });
    };

    const handleIncomingCallRequest = (data) => {
      if (data.type == "chat") return null;
      setIncomingCall({
        roomId: data.roomId,
        agoraToken: data.agoraToken,
        callerId: data.callerId,
        callType: data.type || "audio",
        callerName: data?.callerDetail?.firstName,
      });
    };


    const handleCallCanceled = () => {
      setIncomingCall(null);
    };

    const handleWaitingList = (data) => {
      setWaitingList(data?.list || []);
    };

    voiceSocket.on("connect", onConnect);
    voiceSocket.on("disconnect", onDisconnect);
    voiceSocket.on("connect_error", onConnectError);
    voiceSocket.on("incoming_call", handleIncomingCall);
    voiceSocket.on("incoming", handleIncomingCallRequest);
    voiceSocket.on("call_canceled", handleCallCanceled);
    voiceSocket.on("call:canceled", handleCallCanceled);
    voiceSocket.on("waiting_list", handleWaitingList);

    return () => {
      voiceSocket.off("connect", onConnect);
      voiceSocket.off("disconnect", onDisconnect);
      voiceSocket.off("connect_error", onConnectError);
      voiceSocket.off("call_canceled", handleCallCanceled);
      voiceSocket.off("call:canceled", handleCallCanceled);
      voiceSocket.off("waiting_list", handleWaitingList);
      voiceSocket.off("incoming_call", handleIncomingCall);
      voiceSocket.off("incoming", handleIncomingCallRequest);
      voiceSocket.disconnect();
    };
  }, [astroId]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        setActiveCall,
        waitingList,
        setWaitingList,
        incomingCall,
        setIncomingCall,
        setAstroId,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
