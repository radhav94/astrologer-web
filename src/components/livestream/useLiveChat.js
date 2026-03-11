import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { getUserFromStorage } from "../../utils/authStorage";
import { getLiveUsers } from "../../services/appServices/getLiveStreamService";

const SOCKET_URL = import.meta.env.VITE_APP_API_BASE_URL;

const CHAT_ROOM_SESSION_KEY = "shubhtalk_live_chat_room";

export const useLiveChat = (agoraChannel, isReconnect = false) => {
  const socketRef = useRef(null);
  const roomIdRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);

  const user = getUserFromStorage();
  const userId = user?.astrologer_id || "";
  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Unknown";

  useEffect(() => {
    console.log("LiveChat → Init", { userId, userName, agoraChannel, isReconnect, SOCKET_URL });

    if (!userId || !agoraChannel) {
      console.warn("LiveChat → Missing userId or agoraChannel, skipping");
      return;
    }

    let socket = null;

    const initChat = async () => {
      let chatRoomId = null;

      // On reconnect, try to restore chatRoomId from sessionStorage first
      if (isReconnect) {
        try {
          const saved = sessionStorage.getItem(CHAT_ROOM_SESSION_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.chatRoomId && parsed.channel === agoraChannel) {
              chatRoomId = parsed.chatRoomId;
              console.log("LiveChat → Restored chatRoomId from session:", chatRoomId);
            }
          }
        } catch (e) {
          console.warn("LiveChat → Failed to parse saved chatRoomId", e);
        }
      }

      // If we don't have a chatRoomId yet, fetch from API
      if (!chatRoomId) {
        try {
          const res = await getLiveUsers();
          const liveUsers = res.data?.data || [];
          console.log("LiveChat → Live users response:", JSON.stringify(liveUsers.map(u => ({ channel: u.channel, agoraChannel: u.agoraChannel, chatRoomId: u.chatRoomId }))));
          const session = liveUsers.find(
            (u) => u.channel === agoraChannel || u.agoraChannel === agoraChannel
          );
          chatRoomId = session?.chatRoomId;
          console.log("LiveChat → Fetched chatRoomId:", chatRoomId);
        } catch (err) {
          console.error("LiveChat → Failed to fetch chatRoomId:", err);
        }
      }

      if (!chatRoomId) {
        console.warn("LiveChat → No chatRoomId found for channel:", agoraChannel);
        return;
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

      // Track whether we've already tried fallback to avoid loops
      let didFallbackCreate = false;

      const createRoom = () => {
        console.log("LiveChat → Creating room:", chatRoomId);
        socket.emit("live:create_room", {
          roomId: chatRoomId,
          hostId: userId,
          hostName: userName,
          hostType: "astrologer",
        });
      };

      socket.on("connect", () => {
        console.log("LiveChat → Connected, socketId:", socket.id);
        setIsConnected(true);
        didFallbackCreate = false;

        if (isReconnect) {
          // Reconnecting after page refresh — try rejoining existing room first
          console.log("LiveChat → Rejoining room (reconnect):", chatRoomId);
          socket.emit("live:join_room", {
            roomId: chatRoomId,
            userId,
            userName,
            userType: "host",
          });
        } else {
          createRoom();
        }
      });

      socket.on("disconnect", () => {
        console.log("LiveChat → Disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("LiveChat → Connection error:", err.message);
      });

      // Room created confirmation — host is automatically in the room
      socket.on("live:room_created", (data) => {
        console.log("LiveChat → Room created:", data);
      });

      socket.on("live:joined", (data) => {
        console.log("LiveChat → Joined:", data);
        setParticipantCount(data.participantCount || 0);
      });

      socket.on("live:recent_messages", (data) => {
        if (data?.messages?.length) {
          setMessages(
            data.messages.map((msg) => ({
              id: msg.id,
              sender: msg.userId,
              senderName: msg.userName,
              text: msg.message,
              role: msg.userType === "host" ? "host" : "audience",
              isSelf: msg.userId === userId,
              timestamp: msg.timestamp,
            }))
          );
        }
      });

      socket.on("live:message", (msg) => {
        console.log("LiveChat → Received message:", JSON.stringify(msg));
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

      socket.on("live:error", (data) => {
        console.error("LiveChat → Error:", data.message);

        // If join_room failed because room was cleaned up, fall back to create_room
        // This handles the case where backend removed the room on host disconnect
        if (
          isReconnect &&
          !didFallbackCreate &&
          (data.message?.toLowerCase().includes("not found") ||
           data.message?.toLowerCase().includes("ended") ||
           data.code === "ROOM_NOT_FOUND" ||
           data.code === "ROOM_ENDED")
        ) {
          didFallbackCreate = true;
          console.log("LiveChat → join_room failed, falling back to create_room with same roomId");
          createRoom();
        }
      });

      socket.on("live:room_ended", (data) => {
        console.log("LiveChat → Room ended:", data);
        setIsConnected(false);
      });

      socket.on("live:session_ended", (data) => {
        console.log("LiveChat → Session ended:", data);
      });
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
      console.log("LiveChat → Cleanup done");
    };
  }, [userId, userName, agoraChannel, isReconnect]);

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
    // Clear saved chatRoomId when stream ends
    sessionStorage.removeItem(CHAT_ROOM_SESSION_KEY);
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
