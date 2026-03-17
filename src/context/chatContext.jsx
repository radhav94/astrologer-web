import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { useCall } from "./CallContext";
import toast from "../components/toast";

const ChatContext = createContext();

// 🔑 Persistence keys for chat reconnect
const CHAT_STORAGE_KEY = "shubhtalk_active_chat";
const CHAT_TIMESTAMP_KEY = "shubhtalk_chat_timestamp";
const CHAT_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

// Grace window timeout (backend uses 60s, we use slightly less to show UI feedback)
const RECONNECT_GRACE_TIMEOUT = 55000;

export const ChatProvider = ({ children }) => {

  const {astroId} = useCall();
  const [activeChat, setActiveChatState] = useState(null);

  // ✅ GLOBAL waiting list
  const [waitingList, setWaitingList] = useState([]);

  // ✅ GLOBAL incoming call
  const [incomingChat, setIncomingChat] = useState(null);
  const [chatSeconds, setChatSeconds] = useState(0);
  const [chatStartTime, setChatStartTime] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [networkDisconnected, setNetworkDisconnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
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

  /* ================= PERSISTENCE ================= */
  const persistChatState = useCallback((chatData) => {
    if (!chatData) return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatData));
      localStorage.setItem(CHAT_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn("[ChatContext] Failed to persist chat state:", e);
    }
  }, []);

  const clearPersistedChatState = useCallback((roomId = null) => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CHAT_TIMESTAMP_KEY);
    sessionStorage.removeItem("shubhtalk_chat_seconds");
    localStorage.removeItem("shubhtalk_chat_start_time");
    
    // Clean up room-specific init flag if roomId provided
    if (roomId) {
      localStorage.removeItem(`shubhtalk_chat_init_${roomId}`);
    }
  }, []);

  const restoreChatState = useCallback(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      const timestamp = localStorage.getItem(CHAT_TIMESTAMP_KEY);
      if (!saved || !timestamp) return null;
      const elapsed = Date.now() - Number(timestamp);
      if (elapsed > CHAT_EXPIRY_TIME) {
        const parsed = JSON.parse(saved);
        clearPersistedChatState(parsed?.roomId);
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      console.warn("[ChatContext] Failed to restore chat state:", e);
      clearPersistedChatState();
      return null;
    }
  }, [clearPersistedChatState]);

  /* ================= SET ACTIVE CHAT (wrapper with persistence) ================= */
  const setActiveChat = useCallback((chatData) => {
    // Get current roomId before clearing (for cleanup)
    const currentRoomId = activeChat?.roomId;
    
    setActiveChatState(chatData);
    if (chatData) {
      persistChatState(chatData);
    } else {
      clearPersistedChatState(currentRoomId);
    }
  }, [persistChatState, clearPersistedChatState, activeChat?.roomId]);

  /* ================= RECONNECTION ================= */
  
  // Handle chat:reconnected response from backend
  const handleChatReconnected = useCallback((data) => {
    console.log("[ChatContext] chat:reconnected received:", data);
    
    // Clear any pending grace timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsReconnecting(false);
    setNetworkDisconnected(false);

    if (data && data.active) {
      // Chat is still active — restore it with backend's remaining time
      const restoredChat = {
        ...activeChat,
        remainingTime: data.remainingTime || activeChat?.remainingTime,
      };
      setActiveChatState(restoredChat);
      persistChatState(restoredChat);

      // Restore elapsed timer from sessionStorage
      const savedSeconds = sessionStorage.getItem("shubhtalk_chat_seconds");
      if (savedSeconds) {
        setChatSeconds(Number(savedSeconds));
      }
      startTimer();
    } else {
      // Chat is no longer active — backend ended it
      console.log("[ChatContext] Chat no longer active:", data?.reason);
      setActiveChatState(null);
      clearPersistedChatState(activeChat?.roomId);
      resetTimer();
    }
  }, [activeChat, persistChatState, clearPersistedChatState]);

  // Emit chat:reconnect immediately when socket reconnects
  const emitChatReconnect = useCallback(() => {
    // Use current activeChat state or restore from localStorage
    const currentChat = activeChat || restoreChatState();
    if (!currentChat || !currentChat.roomId) {
      setNetworkDisconnected(false);
      return;
    }

    console.log("[ChatContext] Emitting chat:reconnect for room:", currentChat.roomId);
    setIsReconnecting(true);

    voiceSocket.emit("chat:reconnect", {
      roomId: currentChat.roomId,
      userId: currentChat.userId || currentChat.chaterId,
      astrologerId: currentChat.astrologerId || astroId,
    });
  }, [activeChat, restoreChatState, astroId]);

  // Handle socket disconnect — start grace window countdown
  const handleSocketDisconnect = useCallback((reason) => {
    if (!activeChat) return;
    
    console.log("[ChatContext] Socket disconnected during active chat:", reason);
    setNetworkDisconnected(true);
    
    // Start grace window timeout — if we don't reconnect in time, chat will end
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("[ChatContext] Grace window expired — chat likely ended by backend");
      setNetworkDisconnected(false);
      setIsReconnecting(false);
      setActiveChatState(null);
      clearPersistedChatState(activeChat?.roomId);
      resetTimer();
    }, RECONNECT_GRACE_TIMEOUT);
  }, [activeChat, clearPersistedChatState]);

  // Handle socket connect — emit reconnect if we were disconnected during a chat
  const handleSocketConnect = useCallback(() => {
    // Only emit reconnect if we were actually disconnected during an active chat
    // Don't emit for fresh chats that are just starting
    if (networkDisconnected) {
      emitChatReconnect();
    } else {
      // On initial mount (page refresh), try to restore from localStorage
      // But only if there's no current activeChat (to avoid interfering with fresh chats)
      if (!activeChat) {
        const savedChat = restoreChatState();
        if (savedChat && savedChat.roomId) {
          console.log("[ChatContext] Restoring chat from localStorage on connect");
          setActiveChatState(savedChat);
          // Small delay to let state settle before emitting reconnect
          setTimeout(() => {
            emitChatReconnect();
          }, 100);
        }
      }
    }
  }, [networkDisconnected, activeChat, emitChatReconnect, restoreChatState]);

  // Legacy function for manual reconnection (kept for backward compatibility)
  const reconnectToChat = useCallback(() => {
    emitChatReconnect();
  }, [emitChatReconnect]);


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

  // 🔍 SOCKET DEBUG LISTENERS
  const onConnect = () => {
    console.log("🟢 SOCKET CONNECTED");
    console.log("Socket ID:", voiceSocket.id);
    console.log("Connected:", voiceSocket.connected);
    // Attempt chat reconnection once socket is connected
    handleSocketConnect();
  };

  const onDisconnect = (reason) => {
    console.log("🔴 SOCKET DISCONNECTED:", reason);
    handleSocketDisconnect(reason);
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
  voiceSocket.on("chat:reconnected", handleChatReconnected);

  return () => {
    voiceSocket.off("connect", onConnect);
    voiceSocket.off("disconnect", onDisconnect);
    voiceSocket.off("connect_error", onConnectError);

    // voiceSocket.off("activity", handleActivity);
    voiceSocket.off("incoming", handleIncomingChat);
    voiceSocket.off("chat:canceled", handleChatCanceled);
    voiceSocket.off("waiting_list", handleWaitingList);
    voiceSocket.off("chat:reconnected", handleChatReconnected);
    
    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };
}, [astroId, handleSocketConnect, handleSocketDisconnect, handleChatReconnected]);


  /* ================= BEFOREUNLOAD — persist chat state ================= */
  useEffect(() => {
    if (!activeChat) return;
    const handleBeforeUnload = () => {
      sessionStorage.setItem("shubhtalk_chat_seconds", String(chatSeconds));
      persistChatState(activeChat);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeChat, chatSeconds, persistChatState]);

  /* ================= PAGE VISIBILITY — persist on tab hide ================= */
  useEffect(() => {
    if (!activeChat) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        persistChatState(activeChat);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeChat, persistChatState]);

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
        chatStartTime,
        isReconnecting,
        networkDisconnected
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
