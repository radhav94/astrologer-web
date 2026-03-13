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

  const clearPersistedChatState = useCallback(() => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CHAT_TIMESTAMP_KEY);
    sessionStorage.removeItem("shubhtalk_chat_seconds");
  }, []);

  const restoreChatState = useCallback(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      const timestamp = localStorage.getItem(CHAT_TIMESTAMP_KEY);
      if (!saved || !timestamp) return null;
      const elapsed = Date.now() - Number(timestamp);
      if (elapsed > CHAT_EXPIRY_TIME) {
        clearPersistedChatState();
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
    setActiveChatState(chatData);
    if (chatData) {
      persistChatState(chatData);
    } else {
      clearPersistedChatState();
    }
  }, [persistChatState, clearPersistedChatState]);

  /* ================= RECONNECTION ================= */
  const reconnectToChat = useCallback(() => {
    const savedChat = restoreChatState();
    if (!savedChat || !savedChat.roomId) {
      clearPersistedChatState();
      return;
    }

    console.log("[ChatContext] Attempting chat reconnection for room:", savedChat.roomId);
    setIsReconnecting(true);

    voiceSocket.emit("chat:reconnect", {
      roomId: savedChat.roomId,
      userId: savedChat.userId || savedChat.chaterId,
      astrologerId: savedChat.astrologerId || astroId,
    });

    const onReconnected = (data) => {
      console.log("[ChatContext] chat:reconnected received:", data);
      setIsReconnecting(false);
      voiceSocket.off("chat:reconnected", onReconnected);

      if (data && data.active) {
        // Chat is still active — restore it
        setActiveChatState({
          ...savedChat,
          remainingTime: data.remainingTime || savedChat.remainingTime,
        });
        // Restore timer from remaining time
        if (data.remainingTime) {
          const savedSeconds = sessionStorage.getItem("shubhtalk_chat_seconds");
          if (savedSeconds) {
            setChatSeconds(Number(savedSeconds));
          }
        }
      } else {
        // Chat is no longer active
        console.log("[ChatContext] Chat no longer active:", data?.reason);
        clearPersistedChatState();
      }
    };

    voiceSocket.on("chat:reconnected", onReconnected);

    // Timeout — if backend doesn't respond in 30s, give up
    setTimeout(() => {
      voiceSocket.off("chat:reconnected", onReconnected);
      setIsReconnecting(false);
      clearPersistedChatState();
    }, 30000);
  }, [restoreChatState, clearPersistedChatState, astroId]);


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
    reconnectToChat();
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
        isReconnecting
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
