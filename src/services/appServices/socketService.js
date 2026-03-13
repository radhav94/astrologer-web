// socketService.js
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

class SocketService {
  socket = null;

  connect({ onConnected, onDisconnected, onError, onWarn }) {
    // If already connected, just fire the callback
    if (this.socket?.connected) {
      onConnected?.();
      return;
    }

    // If socket exists but disconnected, reconnect it
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Get astrologer identity for authentication
    const role = localStorage.getItem("shubhtalk_role") || "ASTROLOGER";
    const userData = JSON.parse(
      localStorage.getItem("shubhtalk_astrologer_details") || "{}"
    );
    const astrologerId = userData?._id || userData?.id || "";

    this.socket = io(BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      query: {
        astrologerId,
        role,
      },
    });

    this.socket.on("connect", () => {
      console.log("[SocketService] Connected, id:", this.socket.id);
      onConnected?.();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[SocketService] Disconnected:", reason);
      onDisconnected?.(reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("[SocketService] Connect error:", err.message);
      onError?.("Unable to connect to server");
    });

    this.socket.on("error", (err) => {
      onError?.(err.message || "Unknown error occurred");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  joinRoom({ roomId, userId, astrologerId }) {
    // Reserved for future use
  }

  // USER SEND
  sendMessage({ roomId, userId, astrologerId, message, kundliId }) {
    try {
      if (!this.socket?.connected)
        throw new Error("Socket not connected, try again.");

      this.socket.emit("user_sent_message", {
        sender: userId,
        kundliId,
        roomId,
        userId,
        astrologerId,
        message,
      });

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ASTRO SEND
  astrologerReplied({ roomId, userId, astrologerId, kundliId, message, type = "message" }) {
    try {
      if (!this.socket?.connected)
        throw new Error("Socket not connected, try again.");

      this.socket.emit("chat:message", {
        roomId,
        userId,
        astrologerId,
        message,
        sender: "astrologer",
        kundliId,
        type,
      });

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // TYPING EVENT
  sendTyping({ roomId, sender }) {
    if (this.socket?.connected) {
      this.socket.emit("typing", { roomId, sender });
    }
  }

  // LISTEN EVENTS (MESSAGE + TYPING)
  listenEvents(callbacks) {
    const { onMessage, onTyping } = callbacks;

    this.socket.on("message:recieved", (data) => {
      console.log("message", data);
      onMessage?.({
        sender: data.sender,
        message: data.message || "",
        dateTime: data.createdAt || new Date().toISOString(),
      });
    });

    this.socket.on("typing", (data) => {
      onTyping?.(data);
    });
  }
}

export default new SocketService();
