import { useEffect, useState, useCallback, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useCall } from "../../context/CallContext";

/**
 * Shows a toast-like notification on the live stream screen when a new
 * call or chat request lands in the waiting list (queue).
 *
 * The first incoming call/chat goes directly to incomingCall/incomingChat
 * (handled by IncomingCallModal / IncomingChatModal) and never hits the
 * waiting list — so we only react to waiting list changes here.
 */
const IncomingWaitingNotification = () => {
  // Both contexts receive the same waiting_list from the socket,
  // so we only read from one to avoid double-counting.
  const { waitingList } = useCall();
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const prevLengthRef = useRef(waitingList?.length || 0);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setPopup(null), 300);
  }, []);

  const totalLength = waitingList?.length || 0;

  useEffect(() => {
    if (totalLength > prevLengthRef.current) {
      const allItems = waitingList || [];
      const latest = allItems[allItems.length - 1];

      const type = latest?.type || "chat";
      const name =
        latest?.user?.customer?.firstName ||
        latest?.user?.firstName ||
        latest?.callerName ||
        "Someone";

      const icon = type === "chat" ? "💬" : type === "video" ? "📹" : "📞";
      const label =
        type === "chat"
          ? "Chat request"
          : type === "video"
            ? "Video call request"
            : "Call request";

      setPopup({ icon, label, name, queueSize: totalLength });
      setVisible(true);
    }
    prevLengthRef.current = totalLength;
  }, [totalLength, waitingList]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  if (!popup) return null;

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
        {/* Icon */}
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
            fontSize: 20,
          }}
        >
          {popup.icon}
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
            {popup.label} from {popup.name}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#666",
              lineHeight: 1.4,
            }}
          >
            Added to waiting list ({popup.queueSize} in queue)
          </p>
        </div>

        {/* Close */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "#E85D04",
            flexShrink: 0,
          }}
          aria-label="Dismiss notification"
        >
          <IoClose size={20} />
        </button>
      </div>
    </div>
  );
};

export default IncomingWaitingNotification;
