import { useEffect, useState, useCallback, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { useCall } from "../context/CallContext";
import { useChat as useChatContext } from "../context/chatContext";
import { PATH } from "../utils/routes/Paths";
import { detectURL, isImageURL, extractDomain } from "../utils/helper/linkPreview";

const GRACE_PERIOD_MS = 5000; // Skip messages in first 5s after call connects

const IncomingMessagePopup = () => {
  const { activeCall, setIsCallMinimized, onMessagePopupClickRef } = useCall();
  const { setActiveChat } = useChatContext();
  const navigate = useNavigate();
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

  const handlePopupClick = useCallback(() => {
    if (!activeCall) return;

    // If LiveView registered a callback (live + call), use it instead of navigating
    if (onMessagePopupClickRef?.current) {
      onMessagePopupClickRef.current();
      dismiss();
      return;
    }

    setActiveChat({
      roomId: activeCall.chatRoomId,
      userId: activeCall.userId,
      astrologerId: activeCall.astrologerId,
      remainingTime: activeCall.remainingTime || 0,
    });

    setIsCallMinimized(true);

    navigate(
      PATH.privateRoutes.CHAT_WINDOW.path.replace(":chatId", activeCall.userId),
      {
        state: {
          roomId: activeCall.chatRoomId,
          userId: activeCall.userId,
          astrologerId: activeCall.astrologerId,
          kundliId: activeCall.kundliId,
          fullName: activeCall.callerName,
        },
      }
    );

    dismiss();
  }, [activeCall, navigate, setActiveChat, setIsCallMinimized, dismiss, onMessagePopupClickRef]);

  useEffect(() => {
    if (!activeCall) return;

    const handleMessage = (data) => {
      // Only show popup for user messages (not astrologer's own)
      if (data.sender === "astrologer") return;

      // Skip messages during grace period (auto-sent kundli/messages on call connect)
      if (callStartTimeRef.current && Date.now() - callStartTimeRef.current < GRACE_PERIOD_MS) return;

      const msgType = data?.type || "message";
      let text = data.message || "";

      // Handle special message types
      const typeLabels = {
        audio: "🎤 Voice message",
        video: "🎥 Video message",
        kundli: "📜 Kundli shared",
        image: "🖼️ Image shared",
        attachment: "📎 Attachment shared",
        gift: "🎁 Gift received",
      };

      if (typeLabels[msgType]) {
        text = typeLabels[msgType];
      } else {
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
      }

      if (!text || typeof text !== "string") {
        text = "New message";
      }

      // Truncate long messages
      const displayText = text.length > 100 ? text.slice(0, 100) + "…" : text;
      const detectedUrl = detectURL(text);

      setPopup({
        senderName: activeCall.callerName || "User",
        message: displayText,
        url: detectedUrl,
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
        onClick={handlePopupClick}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 16,
          backgroundColor: "#FFF8EE",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          cursor: "pointer",
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

          {/* URL Preview */}
          {popup.url && (
            <a
              href={popup.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "block",
                marginTop: 8,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {isImageURL(popup.url) && (
                <img
                  src={popup.url}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
              <div
                style={{
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span
                  style={{
                    fontSize: 12,
                    color: "#E85D04",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {extractDomain(popup.url)}
                </span>
              </div>
            </a>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
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
