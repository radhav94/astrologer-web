import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { getUserFromStorage } from "../../utils/authStorage";
import { getLiveUsers } from "../../services/appServices/getLiveStreamService";

const SOCKET_URL = import.meta.env.VITE_APP_API_BASE_URL;

const CHAT_ROOM_SESSION_KEY = "shubhtalk_live_chat_room";
const CHAT_MESSAGES_SESSION_KEY = "shubhtalk_live_chat_messages";

export const useLiveChat = (agoraChannel, isReconnect = false, tokenChatRoomId = null) => {
  const socketRef = useRef(null);
  const roomIdRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    // On reconnect, restore cached messages so they show immediately
    // while waiting for the server's live:recent_messages
    if (isReconnect) {
      try {
        const cached = sessionStorage.getItem(CHAT_MESSAGES_SESSION_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) { /* ignore */ }
    }
    return [];
  });
  const [chatInput, setChatInput] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);

  const user = getUserFromStorage();
  // authStorage saves _id as "id", fall back to the dedicated localStorage key
  const userId = user?.id || localStorage.getItem("shubhtalk_astro_id") || "";
  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Unknown";

  // Persist messages to sessionStorage so host keeps history across refresh
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Keep last 100 to avoid storage bloat
        const toCache = messages.slice(-100);
        sessionStorage.setItem(CHAT_MESSAGES_SESSION_KEY, JSON.stringify(toCache));
      } catch (e) { /* non-critical */ }
    }
  }, [messages]);

  useEffect(() => {
    // agoraChannel is null on initial render while useLiveStreaming fetches
    // the Agora token — silently wait for it to resolve
    if (!agoraChannel) return;

    if (!userId) {
      console.warn("LiveChat → No astrologer ID found in storage, cannot connect");
      return;
    }

    let socket = null;

    const initChat = async () => {
      let chatRoomId = null;

      // 1. Use chatRoomId from the token response (passed by useLiveStreaming)
      if (tokenChatRoomId) {
        chatRoomId = tokenChatRoomId;
      }

      // 2. On reconnect, try to restore from sessionStorage
      if (!chatRoomId && isReconnect) {
        try {
          const saved = sessionStorage.getItem(CHAT_ROOM_SESSION_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.chatRoomId && parsed.channel === agoraChannel) {
              chatRoomId = parsed.chatRoomId;
            }
          }
        } catch (e) {
          console.warn("LiveChat → Failed to parse saved chatRoomId", e);
        }
      }

      // 3. Fall back to getLiveUsers API
      if (!chatRoomId) {
        try {
          const res = await getLiveUsers();
          const liveUsers = res.data?.data || [];
          const session = liveUsers.find(
            (u) => u.channel === agoraChannel || u.agoraChannel === agoraChannel
          );
          chatRoomId = session?.chatRoomId;
        } catch (err) {
          console.error("LiveChat → Failed to fetch chatRoomId:", err);
        }
      }

      // 4. Last resort: use the agoraChannel as the roomId
      //    live:create_room will create a new Redis room with this ID
      if (!chatRoomId) {
        chatRoomId = agoraChannel;
      }

      // Persist chatRoomId so reconnects don't need the API lookup
      try {
        sessionStorage.setItem(
          CHAT_ROOM_SESSION_KEY,
          JSON.stringify({ chatRoomId, channel: agoraChannel })
        );
      } catch (e) {
        // non-critical
      }

      setRoomId(chatRoomId);
      roomIdRef.current = chatRoomId;

      // Connect with both query and auth carrying the astrologer identity
      // Server reads query for role/userId and auth for host ID resolution
      socket = io(SOCKET_URL, {
        transports: ["websocket"],
        query: {
          role: "ASTROLOGER",
          astrologerId: userId,
        },
        auth: {
          role: "ASTROLOGER",
          astrologerId: userId,
        },
      });
      socketRef.current = socket;

      // Track fallback attempts to avoid infinite loops
      let didFallbackCreate = false;
      let didFallbackJoin = false;

      const createRoom = () => {
        socket.emit("live:create_room", {
          roomId: roomIdRef.current,
          hostId: userId,
          hostName: userName,
          hostType: "astrologer",
        });
      };

      const joinRoom = () => {
        socket.emit("live:join_room", {
          roomId: roomIdRef.current,
          userId,
          userName,
          userType: "host",
        });
      };

      socket.on("connect", () => {
        setIsConnected(true);
        didFallbackCreate = false;
        didFallbackJoin = false;

        if (isReconnect) {
          // On refresh the room likely still exists (backend grace period),
          // so join it to get recent messages and participant count
          joinRoom();
        } else {
          createRoom();
        }
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("LiveChat → Connection error:", err.message);
      });

      // Room created/reused confirmation
      // Always use the server-returned roomId — it may differ if the server
      // reused an existing room after a refresh/reconnect
      socket.on("live:room_created", (data) => {
        if (data?.roomId) {
          roomIdRef.current = data.roomId;
          setRoomId(data.roomId);

          // Update sessionStorage with the canonical roomId
          try {
            sessionStorage.setItem(
              CHAT_ROOM_SESSION_KEY,
              JSON.stringify({ chatRoomId: data.roomId, channel: agoraChannel })
            );
          } catch (e) {
            // non-critical
          }
        }
      });

      socket.on("live:joined", (data) => {
        setParticipantCount(data.participantCount || 0);
      });

      socket.on("live:recent_messages", (data) => {
        const msgList = Array.isArray(data) ? data : data?.messages;
        if (msgList?.length) {
          // Server has messages — use them as the authoritative source
          const mapped = msgList.map((msg) => ({
            id: msg.id,
            sender: msg.userId,
            senderName: msg.userName,
            text: msg.message,
            role: msg.userType === "host" ? "host" : "audience",
            isSelf: msg.userId === userId,
            timestamp: msg.timestamp,
          }));
          setMessages(mapped);
        }
        // If server sends 0 messages, keep whatever we have (cached from sessionStorage)
      });

      socket.on("live:message", (msg) => {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id || `msg_${Date.now()}`,
            sender: msg.userId,
            senderName: msg.userName,
            text: msg.message,
            role: msg.userType === "host" ? "host" : "audience",
            isSelf: msg.userId === userId,
            timestamp: msg.timestamp,
          },
        ]);
      });

      socket.on("live:user_joined", (data) => {
        setParticipantCount(data.participantCount || 0);
      });

      socket.on("live:user_left", (data) => {
        setParticipantCount(data.participantCount || 0);
      });

      // Broadcast when a live session starts (informational for host)
      socket.on("live:session_started", () => {});

      // Live status push — only relevant for customer sockets, but listen
      // defensively so the host app doesn't break if the server sends it
      socket.on("live:astrologer_status", () => {});

      socket.on("live:error", (data) => {
        const msg = data.message?.toLowerCase() || "";
        const code = data.code || "";

        // "Room already exists" → create_room failed because room survived
        // the refresh. Fall back to join_room to rejoin and get recent messages.
        if (
          !didFallbackJoin &&
          (msg.includes("already exist") || code === "ROOM_EXISTS")
        ) {
          didFallbackJoin = true;
          joinRoom();
          return;
        }

        // "Room not found / ended" → join_room failed because Redis cleaned
        // up the room. Fall back to create_room with a fresh ID.
        if (
          !didFallbackCreate &&
          (msg.includes("not found") || msg.includes("ended") ||
           code === "ROOM_NOT_FOUND" || code === "ROOM_ENDED")
        ) {
          didFallbackCreate = true;
          chatRoomId = agoraChannel;
          roomIdRef.current = chatRoomId;
          setRoomId(chatRoomId);
          createRoom();
          return;
        }

        console.error("LiveChat → Error:", data.message);
      });

      socket.on("live:room_ended", () => {
        setIsConnected(false);
      });

      socket.on("live:session_ended", () => {});
    };

    initChat();

    return () => {
      if (roomIdRef.current && socketRef.current) {
        socketRef.current.emit("live:leave_room", {
          roomId: roomIdRef.current,
          userId,
          userName,
        });
      }
      socketRef.current?.disconnect();
    };
  }, [userId, userName, agoraChannel, isReconnect, tokenChatRoomId]);

  const sendChatMessage = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg || !socketRef.current?.connected || !roomIdRef.current) return;

    socketRef.current.emit("live:send_message", {
      roomId: roomIdRef.current,
      userId,
      userName,
      message: msg,
      userType: "host",
    });

    setChatInput("");
  }, [chatInput, userId, userName]);

  const endRoom = useCallback(() => {
    if (!socketRef.current?.connected || !roomIdRef.current) return;
    socketRef.current.emit("live:end_room", {
      roomId: roomIdRef.current,
      hostId: userId,
    });
    sessionStorage.removeItem(CHAT_ROOM_SESSION_KEY);
    sessionStorage.removeItem(CHAT_MESSAGES_SESSION_KEY);
  }, [userId]);

  return {
    messages,
    chatInput,
    setChatInput,
    sendChatMessage,
    participantCount,
    isConnected,
    endRoom,
    roomId,
  };
};
