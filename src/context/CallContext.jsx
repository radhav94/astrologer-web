import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { voiceSocket } from "../services/appServices/voiceSocketServices";

const CallContext = createContext();

// 🔑 LocalStorage keys for call persistence
const CALL_STORAGE_KEY = "shubhtalk_active_call";
const CALL_TIMESTAMP_KEY = "shubhtalk_call_timestamp";
const CALL_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

// ⚙️ Feature flag - Backend now implements call:reconnect & call:reconnected
const RECONNECTION_ENABLED = true;

// Grace window timeout (backend uses 60s, we use slightly less to show UI feedback)
const RECONNECT_GRACE_TIMEOUT = 55000;

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
  const [networkDisconnected, setNetworkDisconnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isUpgradeRejectionProtected, setIsUpgradeRejectionProtected] = useState(false);
  const [isCallMinimized, setIsCallMinimizedState] = useState(
    () => sessionStorage.getItem("shubhtalk_call_minimized") === "true"
  );
  const timerRef = useRef(null);
  const activeCallRef = useRef(null); // Synchronous ref for reading activeCall in socket handlers
  const upgradeRejectionRef = useRef(false); // Immediate protection using ref
  const isUpgradingRef = useRef(false); // 🔑 Synchronous ref for upgrade-in-progress (readable in cleanup closures)

  // Persist minimized state to sessionStorage
  const setIsCallMinimized = useCallback((value) => {
    setIsCallMinimizedState(value);
    if (value) {
      sessionStorage.setItem("shubhtalk_call_minimized", "true");
    } else {
      sessionStorage.removeItem("shubhtalk_call_minimized");
    }
  }, []);

  // Reset minimized state only when call transitions from active → ended
  const prevActiveCallRef = useRef(activeCall);
  useEffect(() => {
    if (prevActiveCallRef.current && !activeCall) {
      setIsCallMinimized(false);
    }
    prevActiveCallRef.current = activeCall;
    activeCallRef.current = activeCall;
  }, [activeCall, setIsCallMinimized]);

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

  const startReconnectGraceWindow = useCallback((callData) => {
    if (!RECONNECTION_ENABLED || !callData?.roomId) return;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setNetworkDisconnected(true);
    setIsReconnecting(true);

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("[CallContext] Grace window expired — call likely ended by backend");
      setNetworkDisconnected(false);
      setIsReconnecting(false);
      setActiveCallState(null);
      clearPersistedCallState();
      setCallStartTimeState(null);
      setCallTimer(0);
      resetTimer();
      sessionStorage.removeItem("shubhtalk_call_start_time");
      sessionStorage.removeItem("shubhtalk_active_call");
    }, RECONNECT_GRACE_TIMEOUT);
  }, [clearPersistedCallState, resetTimer]);

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
  
  // Handle call:reconnected response from backend
  const handleCallReconnected = useCallback((data) => {
    console.log("[CallContext] call:reconnected received:", data);
    const currentCall = activeCall || restoreCallState();
    const hasMismatchedRoom =
      data?.roomId &&
      currentCall?.roomId &&
      data.roomId !== currentCall.roomId;

    if (hasMismatchedRoom) {
      console.log("[CallContext] Ignoring call:reconnected for different room:", data.roomId, "expected:", currentCall.roomId);
      return;
    }
    
    // Clear any pending grace timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsReconnecting(false);
    setNetworkDisconnected(false);

    const backendStatus =
      typeof data?.status === "string" ? data.status.toLowerCase() : null;
    const isExplicitlyActive =
      data?.active === true || backendStatus === "active";
    const isExplicitlyInactive =
      data?.active === false || (backendStatus && backendStatus !== "active");

    if (currentCall?.roomId && isExplicitlyActive) {
      // 🔑 Use backend's type as source of truth — it may have changed
      const backendCallType = data.type || data.callType || currentCall?.callType;
      console.log("[CallContext] Reconnected as callType:", backendCallType);

      const restoredCall = {
        ...currentCall,
        callType: backendCallType,
        agoraToken: data.agoraToken || currentCall?.agoraToken,
        remainingTime: data.remainingTime || currentCall?.remainingTime,
      };

      setActiveCallState(restoredCall);
      persistCallState(restoredCall);

      if (data.remainingTime) {
        setCallSeconds(Number(data.remainingTime) * 60);
      }
    } else if (isExplicitlyInactive || !currentCall?.roomId) {
      // Call is no longer active — backend ended it
      console.log("[CallContext] Call no longer active:", data?.status || data?.reason);
      setActiveCallState(null);
      clearPersistedCallState();
    } else {
      console.log("[CallContext] Ambiguous reconnect response — preserving current call:", data);
      if (currentCall) {
        setActiveCallState(currentCall);
        persistCallState(currentCall);
      }
    }
  }, [activeCall, restoreCallState, persistCallState, clearPersistedCallState]);

  // Emit call:reconnect immediately when socket reconnects
  const emitCallReconnect = useCallback(() => {
    if (!RECONNECTION_ENABLED) return;
    
    // Use current activeCall state or restore from localStorage
    const currentCall = activeCall || restoreCallState();
    if (!currentCall || !currentCall.roomId) {
      setNetworkDisconnected(false);
      return;
    }

    console.log("[CallContext] Emitting call:reconnect for room:", currentCall.roomId);
    setIsReconnecting(true);

    voiceSocket.emit("call:reconnect", {
      roomId: currentCall.roomId,
      userId: currentCall.userId,
      astrologerId: currentCall.astrologerId,
      callType: currentCall.callType || "audio",
    });
  }, [activeCall, restoreCallState]);

  const recoverCallAfterSystemDisconnect = useCallback((data, options = {}) => {
    if (!RECONNECTION_ENABLED) return false;

    const { emitReconnect = true } = options;
    const currentCall = activeCall || restoreCallState();
    const isRecoverable =
      data?.endedBy === "SYSTEM" &&
      data?.endReason === "socket-disconnect" &&
      currentCall?.roomId &&
      (!data?.roomId || data.roomId === currentCall.roomId);

    if (!isRecoverable) {
      return false;
    }

    console.log("[CallContext] Recovering call after system socket disconnect:", JSON.stringify(data));

    setActiveCallState(currentCall);
    persistCallState(currentCall);
    startReconnectGraceWindow(currentCall);

    if (emitReconnect && voiceSocket.connected) {
      emitCallReconnect();
    }

    return true;
  }, [activeCall, restoreCallState, persistCallState, startReconnectGraceWindow, emitCallReconnect]);

  // Handle socket disconnect — start grace window countdown
  const handleSocketDisconnect = useCallback((reason) => {
    if (!RECONNECTION_ENABLED || !activeCall) return;
    
    console.log("[CallContext] Socket disconnected during active call:", reason);
    startReconnectGraceWindow(activeCall);
  }, [activeCall, startReconnectGraceWindow]);

  // Handle socket connect — emit reconnect if we were disconnected during a call
  const handleSocketConnect = useCallback(() => {
    if (!RECONNECTION_ENABLED) return;
    
    // Only emit reconnect if we were actually disconnected during an active call
    // Don't emit for fresh calls that are just starting
    if (networkDisconnected) {
      emitCallReconnect();
    } else {
      // On initial mount (page refresh), try to restore from localStorage
      // But only if there's no current activeCall (to avoid interfering with fresh calls)
      if (!activeCall) {
        const savedCall = restoreCallState();
        if (savedCall && savedCall.roomId) {
          console.log("[CallContext] Restoring call from localStorage on connect");
          setActiveCallState(savedCall);
          // Small delay to let state settle before emitting reconnect
          setTimeout(() => {
            emitCallReconnect();
          }, 100);
        }
      }
    }
  }, [networkDisconnected, activeCall, emitCallReconnect, restoreCallState]);

  // Legacy function for manual reconnection (kept for backward compatibility)
  const reconnectToCall = useCallback(() => {
    if (!RECONNECTION_ENABLED) return;
    emitCallReconnect();
  }, [emitCallReconnect]);

  /* 🔥 Listen to login/logout changes */
  useEffect(() => {
    const syncAstroId = () => {
      setAstroId(localStorage.getItem("shubhtalk_astro_id"));
    };

    window.addEventListener("storage", syncAstroId);
    return () => window.removeEventListener("storage", syncAstroId);
  }, []);

  // Use refs for handlers to avoid useEffect re-running when handlers change
  const handleSocketConnectRef = useRef(handleSocketConnect);
  const handleSocketDisconnectRef = useRef(handleSocketDisconnect);
  const handleCallReconnectedRef = useRef(handleCallReconnected);
  const recoverCallAfterSystemDisconnectRef = useRef(recoverCallAfterSystemDisconnect);
  
  // Keep refs updated
  useEffect(() => {
    handleSocketConnectRef.current = handleSocketConnect;
    handleSocketDisconnectRef.current = handleSocketDisconnect;
    handleCallReconnectedRef.current = handleCallReconnected;
    recoverCallAfterSystemDisconnectRef.current = recoverCallAfterSystemDisconnect;
  }, [handleSocketConnect, handleSocketDisconnect, handleCallReconnected, recoverCallAfterSystemDisconnect]);

  useEffect(() => {
    if (!astroId) {
      if (voiceSocket.connected) voiceSocket.disconnect();
      return;
    }

    // Skip socket connection when running inside an iframe (e.g. Kundli view)
    if (window.self !== window.top) {
      return;
    }

    // Only disconnect and reconnect if not already connected with same astroId
    // This prevents unnecessary reconnections
    if (voiceSocket.connected && voiceSocket.io.opts.query?.astrologerId === astroId) {
      console.log("[CallContext] Socket already connected with same astroId, skipping reconnect");
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

    const onConnect = () => {
      console.log("🟢 SOCKET CONNECTED:", voiceSocket.id);
      handleSocketConnectRef.current();
    };

    const onDisconnect = (r) => {
      console.log("SOCKET DISCONNECTED:", r);
      handleSocketDisconnectRef.current(r);
    };

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

    const handleCallCanceled = (data) => {
      // Only dismiss the incoming call popup if the canceled call
      // matches the one currently being shown. Without this check,
      // a waiting-list user canceling would hide the popup for the
      // first caller's incoming call.
      const canceledRoomId = data?.sessionData?.roomId || data?.roomId;
      setIncomingCall((current) => {
        if (!current) return null;
        if (canceledRoomId && canceledRoomId !== current.roomId) return current;
        return null;
      });

      // Also end the active call if the user declined the astrologer-initiated call.
      // When astrologer accepts from waiting list, activeCall is set immediately.
      // If the user then declines, call:canceled fires but activeCall was never cleared.
      const currentCall = activeCallRef.current;
      if (currentCall && canceledRoomId && canceledRoomId === currentCall.roomId) {
        setActiveCallState(null);
        clearPersistedCallState();
        setCallStartTimeState(null);
        setCallTimer(0);
        resetTimer();
      }
    };

    const handleWaitingList = (data) => {
      setWaitingList(data?.list || []);
    };

    // Handle call:ended from backend (when user or system ends the call)
    const handleCallEnded = (data) => {
      console.log("[CallContext] call:ended received:", data);
      if (recoverCallAfterSystemDisconnectRef.current(data, { emitReconnect: false })) {
        return;
      }
      // Clear reconnection state
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsReconnecting(false);
      setNetworkDisconnected(false);
      // Note: We don't clear activeCall here - let VoiceCall/VideoCall handle cleanup
      // They will show review modal and then clear activeCall
    };

    const onCallReconnected = (data) => {
      handleCallReconnectedRef.current(data);
    };

    voiceSocket.on("connect", onConnect);
    voiceSocket.on("disconnect", onDisconnect);
    voiceSocket.on("connect_error", onConnectError);
    voiceSocket.on("incoming_call", handleIncomingCall);
    voiceSocket.on("incoming", handleIncomingCallRequest);
    voiceSocket.on("call_canceled", handleCallCanceled);
    voiceSocket.on("call:canceled", handleCallCanceled);
    voiceSocket.on("waiting_list", handleWaitingList);
    voiceSocket.on("call:reconnected", onCallReconnected);
    voiceSocket.on("call:ended", handleCallEnded);

    return () => {
      voiceSocket.off("connect", onConnect);
      voiceSocket.off("disconnect", onDisconnect);
      voiceSocket.off("connect_error", onConnectError);
      voiceSocket.off("call_canceled", handleCallCanceled);
      voiceSocket.off("call:canceled", handleCallCanceled);
      voiceSocket.off("waiting_list", handleWaitingList);
      voiceSocket.off("incoming_call", handleIncomingCall);
      voiceSocket.off("incoming", handleIncomingCallRequest);
      voiceSocket.off("call:reconnected", onCallReconnected);
      voiceSocket.off("call:ended", handleCallEnded);
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      voiceSocket.disconnect();
    };
  }, [astroId]); // Only depend on astroId - handlers use refs

  /* ================= ATTEMPT RECONNECTION ON MOUNT (handled by socket connect now) ================= */
  // Note: reconnectToCall is now triggered by handleSocketConnect when socket connects

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
        networkDisconnected,
        callSeconds,
        setCallSeconds,
        startTimer,
        stopTimer,
        resetTimer,
        recoverCallAfterSystemDisconnect,
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
