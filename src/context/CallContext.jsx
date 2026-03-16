import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { voiceSocket } from "../services/appServices/voiceSocketServices";

const CallContext = createContext();

// 🔑 LocalStorage keys for call persistence
const CALL_STORAGE_KEY = "shubhtalk_active_call";
const CALL_TIMESTAMP_KEY = "shubhtalk_call_timestamp";
const CALL_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

// ⚙️ Feature flag - Backend now implements call:reconnect & call:reconnected
const RECONNECTION_ENABLED = true;

export const CallProvider = ({ children }) => {
  const [astroId, setAstroId] = useState(
    () => localStorage.getItem("shubhtalk_astro_id")
  );

  const [activeCall, setActiveCallState] = useState(null);
  const [callStartTime, setCallStartTimeState] = useState(null);
  const [callTimer, setCallTimer] = useState(0); // Shared timer state
  const [waitingList, setWaitingList] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [openReview, setOpenReview] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isUpgradeRejectionProtected, setIsUpgradeRejectionProtected] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const timerRef = useRef(null);
  const upgradeRejectionRef = useRef(false); // Immediate protection using ref
  const isUpgradingRef = useRef(false); // 🔑 Synchronous ref for upgrade-in-progress (readable in cleanup closures)

  // Reset minimized state when call ends
  useEffect(() => {
    if (!activeCall) {
      setIsCallMinimized(false);
    }
  }, [activeCall]);

  // Shared Agora state for smooth call upgrades
  const [sharedAgoraState, setSharedAgoraState] = useState({
    client: null,
    micTrack: null,
    cameraTrack: null,
    isUpgrading: false,
    isDowngrading: false
  });

  /* 🔥 Shared timer that updates every second when call is active */
  useEffect(() => {
    if (activeCall && callStartTime) {
      const interval = setInterval(() => {
        setCallTimer(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCallTimer(0);
    }
  }, [activeCall, callStartTime]);

  /* ================= TIMER ================= */
  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCallSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setCallSeconds(0);
  };

  /* ================= PERSISTENCE (gated by RECONNECTION_ENABLED) ================= */
  const persistCallState = useCallback((callData) => {
    if (!RECONNECTION_ENABLED) return;
    try {
      localStorage.setItem(CALL_STORAGE_KEY, JSON.stringify(callData));
      localStorage.setItem(CALL_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn("[CallContext] Failed to persist call state:", e);
    }
  }, []);

  const clearPersistedCallState = useCallback(() => {
    localStorage.removeItem(CALL_STORAGE_KEY);
    localStorage.removeItem(CALL_TIMESTAMP_KEY);
  }, []);

  const restoreCallState = useCallback(() => {
    if (!RECONNECTION_ENABLED) return null;
    try {
      const saved = localStorage.getItem(CALL_STORAGE_KEY);
      const timestamp = localStorage.getItem(CALL_TIMESTAMP_KEY);
      if (!saved || !timestamp) return null;
      const elapsed = Date.now() - Number(timestamp);
      if (elapsed > CALL_EXPIRY_TIME) {
        clearPersistedCallState();
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      console.warn("[CallContext] Failed to restore call state:", e);
      clearPersistedCallState();
      return null;
    }
  }, [clearPersistedCallState]);

  /* ================= SET ACTIVE CALL (wrapper with persistence) ================= */
  const setActiveCall = useCallback((callData) => {
    const prevCall = activeCall;
    setActiveCallState(callData);
    if (callData) {
      // Only reset timer if this is a genuinely new call (different roomId),
      // not an upgrade of the current call (same roomId, different callType)
      const isSameRoom = prevCall && prevCall.roomId === callData.roomId;
      if (!isSameRoom) {
        setCallStartTimeState(null);
        setCallTimer(0);
        sessionStorage.removeItem("shubhtalk_call_start_time");
      }
      persistCallState(callData);
    } else {
      clearPersistedCallState();
    }
  }, [activeCall, persistCallState, clearPersistedCallState]);

  /* ================= SET CALL START TIME (wrapper with sessionStorage) ================= */
  const setCallStartTime = useCallback((val) => {
    setCallStartTimeState(val);
    if (val) {
      sessionStorage.setItem("shubhtalk_call_start_time", String(val));
    } else {
      sessionStorage.removeItem("shubhtalk_call_start_time");
    }
  }, []);

  /* ================= RECONNECTION (gated by RECONNECTION_ENABLED) ================= */
  const reconnectToCall = useCallback(() => {
    if (!RECONNECTION_ENABLED) return;
    const savedCall = restoreCallState();
    if (!savedCall || !savedCall.roomId) {
      clearPersistedCallState();
      return;
    }

    console.log("[CallContext] Attempting reconnection for room:", savedCall.roomId);
    setIsReconnecting(true);

    // Emit reconnect request to backend
    voiceSocket.emit("call:reconnect", {
      roomId: savedCall.roomId,
      userId: savedCall.userId,
      astrologerId: savedCall.astrologerId,
      callType: savedCall.callType,
    });

    // Listen for backend response
    const onReconnected = (data) => {
      console.log("[CallContext] call:reconnected received:", data);
      setIsReconnecting(false);
      voiceSocket.off("call:reconnected", onReconnected);

      if (data && data.active) {
        // 🔑 Use backend's type as source of truth — it may have changed
        // (e.g. audio→video upgrade happened before refresh)
        const backendCallType = data.type || data.callType || savedCall.callType;
        console.log("[CallContext] Reconnecting as callType:", backendCallType, "(saved was:", savedCall.callType, ")");

        const restoredCall = {
          ...savedCall,
          callType: backendCallType,
          agoraToken: data.agoraToken || savedCall.agoraToken,
          remainingTime: data.remainingTime || savedCall.remainingTime,
        };

        setActiveCallState(restoredCall);
        persistCallState(restoredCall); // Update localStorage with correct callType

        if (data.remainingTime) {
          setCallSeconds(Number(data.remainingTime) * 60);
        }
      } else {
        // Call is no longer active
        clearPersistedCallState();
      }
    };

    voiceSocket.on("call:reconnected", onReconnected);

    // Timeout — if backend doesn't respond in 30s, give up
    setTimeout(() => {
      voiceSocket.off("call:reconnected", onReconnected);
      setIsReconnecting(false);
      clearPersistedCallState();
    }, 30000);
  }, [restoreCallState, clearPersistedCallState, persistCallState]);

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

    // Skip socket connection when running inside an iframe (e.g. Kundli view)
    if (window.self !== window.top) {
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
        callerName: [data?.callerDetail?.firstName, data?.callerDetail?.lastName].filter(Boolean).join(' '),
        userId: data.userId || data.callerId,
        astrologerId: data.astrologerId || astroId,
        chatRoomId: data.chatRoomId || data.roomId,
        kundliId: data.kundliId,
      });
    };

    const handleIncomingCallRequest = (data) => {
      if (data.type == "chat") return null;
      setIncomingCall({
        roomId: data.roomId,
        agoraToken: data.agoraToken,
        callerId: data.callerId,
        callType: data.type || "audio",
        callerName: [data?.callerDetail?.firstName, data?.callerDetail?.lastName].filter(Boolean).join(' '),
        userId: data.userId || data.callerId,
        astrologerId: data.astrologerId || astroId,
        chatRoomId: data.chatRoomId || data.roomId,
        kundliId: data.kundliId,
        userID: data?.callerDetail?.user_ID
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

  /* ================= ATTEMPT RECONNECTION ON MOUNT ================= */
  useEffect(() => {
    if (RECONNECTION_ENABLED) {
      reconnectToCall();
    }
    // eslint-disable-next-line
  }, []);

  /* ================= BEFOREUNLOAD (gated by RECONNECTION_ENABLED) ================= */
  useEffect(() => {
    if (!RECONNECTION_ENABLED || !activeCall) return;
    const handleBeforeUnload = () => {
      // Persist latest call seconds for resume
      sessionStorage.setItem("shubhtalk_call_seconds", String(callSeconds));
      persistCallState(activeCall);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeCall, callSeconds, persistCallState]);

  /* ================= PAGE VISIBILITY (gated by RECONNECTION_ENABLED) ================= */
  useEffect(() => {
    if (!RECONNECTION_ENABLED || !activeCall) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        persistCallState(activeCall);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeCall, persistCallState]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        setActiveCall,
        callStartTime,
        setCallStartTime,
        callTimer,
        waitingList,
        setWaitingList,
        incomingCall,
        setIncomingCall,
        setAstroId,
        astroId,
        openReview,
        setOpenReview,
        reviewData,
        setReviewData,
        isReconnecting,
        callSeconds,
        setCallSeconds,
        startTimer,
        stopTimer,
        resetTimer,
        sharedAgoraState,
        setSharedAgoraState,
        isUpgradeRejectionProtected,
        setIsUpgradeRejectionProtected,
        upgradeRejectionRef,
        isUpgradingRef,
        isCallMinimized,
        setIsCallMinimized
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
