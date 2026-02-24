import { useEffect, useState, useCallback, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { useCall } from "../context/CallContext";

const GRACE_PERIOD_MS = 5000; // Skip messages in first 5s after call connects

const IncomingMessagePopup = () => {
  const { activeCall } = useCall();
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const callStartTimeRef = useRef(null);

  // Track when the call becomes active
  useEffect(() => {
    if (activeCall) {
      callStartTimeRef.current = Date.now();
    } else {
      callStartTimeRef.current = null;
    }
  }, [activeCall]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setPopup(null), 300);
  }, []);

  useEffect(() => {
    if (!activeCall) return;

    const handleMessage = (data) => {
      // Only show popup for user messages (not astrologer's own)
      if (data.sender === "astrologer") return;

      // Skip messages during grace period (auto-sent kundli/messages on call connect)
      if (callStartTimeRef.current && Date.now() - callStartTimeRef.current < GRACE_PERIOD_MS) return;

      let text = data.message || "";
      // Try to detect voice messages (JSON with audioUrl)
      try {
        if (typeof text === "string") {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === "object" && parsed.audioUrl) {
            text = "🎤 Voice message";
          }
        }
      } catch {
        // not JSON, keep as-is
      }

      if (!text || typeof text !== "string") {
        text = "New message";
      }

      // Truncate long messages
      const displayText = text.length > 100 ? text.slice(0, 100) + "…" : text;

      setPopup({
        senderName: activeCall.callerName || "User",
        message: displayText,
      });
      setVisible(true);
    };

    voiceSocket.on("message:recieved", handleMessage);

    return () => {
      voiceSocket.off("message:recieved", handleMessage);
    };
  }, [activeCall]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  if (!activeCall || !popup) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "-120%"})`,
        zIndex: 999999,
        width: "90%",
        maxWidth: 400,
        transition: "transform 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 16,
          backgroundColor: "#FFF8EE",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            backgroundColor: "#F5A623",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.3,
            }}
          >
            New message from {popup.senderName}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#666",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {popup.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "#E85D04",
            flexShrink: 0,
          }}
          aria-label="Dismiss message notification"
        >
          <IoClose size={20} />
        </button>
      </div>
    </div>
  );
};

export default IncomingMessagePopup;
