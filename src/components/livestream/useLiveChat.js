import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { getUserFromStorage } from "../../utils/authStorage";
import { getLiveUsers } from "../../services/appServices/getLiveStreamService";

const SOCKET_URL = import.meta.env.VITE_APP_API_BASE_URL;

export const useLiveChat = (agoraChannel) => {
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
    console.log("LiveChat → Init", { userId, userName, agoraChannel, SOCKET_URL });

    if (!userId || !agoraChannel) {
      console.warn("LiveChat → Missing userId or agoraChannel, skipping");
      return;
    }

    let socket = null;

    const initChat = async () => {
      // Fetch chatRoomId by matching the agora channel
      let chatRoomId = null;
      try {
        const res = await getLiveUsers();
        const liveUsers = res.data?.data || [];
        const session = liveUsers.find(
          (u) => u.channel === agoraChannel || u.agoraChannel === agoraChannel
        );
        chatRoomId = session?.chatRoomId;
        console.log("LiveChat → Fetched chatRoomId:", chatRoomId);
      } catch (err) {
        console.error("LiveChat → Failed to fetch chatRoomId:", err);
      }

      if (!chatRoomId) {
        console.warn("LiveChat → No chatRoomId found for channel:", agoraChannel);
        return;
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

      socket.on("connect", () => {
        console.log("LiveChat → Connected, socketId:", socket.id);
        setIsConnected(true);

        // Host creates the chat room using chatRoomId from API
        console.log("LiveChat → Creating room:", chatRoomId);
        socket.emit("live:create_room", {
          roomId: chatRoomId,
          hostId: userId,
          hostName: userName,
          hostType: "astrologer",
        });
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
  }, [userId, userName, agoraChannel]);

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
