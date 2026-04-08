import { useCallback } from "react";
import { X, Phone, Video, MessageSquare, Clock } from "lucide-react";
import { useCall } from "../../context/CallContext";
import { useChat } from "../../context/chatContext";
import { voiceSocket } from "../../services/appServices/voiceSocketServices";
import { Toast } from "../../components";
import "./WaitingListPanel.scss";

const WaitingListPanel = ({ show, onClose }) => {
  const { waitingList, setWaitingList, activeCall, setActiveCall, setIsCallMinimized } = useCall();
  const { activeChat, setActiveChat } = useChat();

  const getUserName = (call) => {
    const customer = call?.user?.customer;
    const astro = call?.user?.astro;
    if (customer?.firstName)
      return `${customer.firstName}${customer.lastName ? " " + customer.lastName : ""}`;
    if (astro?.firstName)
      return `${astro.firstName}${astro.lastName ? " " + astro.lastName : ""}`;
    return call?.callerName || call?.callerId || "User";
  };

  const getUserImage = (call) =>
    call?.user?.customer?.profileImgUrl ||
    call?.user?.astro?.profileImgUrl ||
    call?.user?.profileImage ||
    "";

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTypeIcon = (type) => {
    if (type === "chat") return <MessageSquare size={14} />;
    if (type === "video") return <Video size={14} />;
    return <Phone size={14} />;
  };

  const handleAccept = useCallback(
    async (call) => {
      if (!call?.roomId || !call?.agoraToken) return;
      if (activeCall || activeChat) {
        Toast.error("Please end the current call/chat first");
        return;
      }

      setActiveCall(null);
      await new Promise((r) => setTimeout(r, 0));

      voiceSocket.emit("waiting:accept", { roomId: call.roomId });
      setWaitingList((prev) => prev.filter((i) => i.roomId !== call.roomId));

      await new Promise((r) => setTimeout(r, 50));

      // Build caller name from nested user data (same logic as getUserName)
      const customer = call?.user?.customer;
      const astro = call?.user?.astro;
      let callerName = call?.callerName;
      if (!callerName) {
        if (customer?.firstName) {
          callerName = `${customer.firstName}${customer.lastName ? " " + customer.lastName : ""}`;
        } else if (astro?.firstName) {
          callerName = `${astro.firstName}${astro.lastName ? " " + astro.lastName : ""}`;
        } else {
          callerName = call?.callerId || "User";
        }
      }

      if (call.type === "chat") {
        Toast.success("Wait for customer to accept");
      } else {
        // Also emit call:accept so the user side gets notified
        voiceSocket.emit("call:accept", {
          roomId: call.roomId,
          token: call.agoraToken,
          channelName: call.roomId,
          acceptedBy: "ASTROLOGER",
          callType: call.type || "audio",
        });

        // Start call minimized so livestream stays visible
        setIsCallMinimized(true);

        setActiveCall({
          roomId: call.roomId,
          agoraToken: call.agoraToken,
          callerName,
          isUserSide: false,
          callType: call.type || "audio",
          userId: call.userId || customer?._id || astro?._id || call.callerId,
          astrologerId: call.astrologerId,
          chatRoomId: call.chatRoomId || call.roomId,
          kundliId: call.kundliId,
          userID: customer?.user_ID || astro?.user_ID || call.userID,
        });

        // Close the panel so astrologer stays on the live view
        onClose?.();
      }
    },
    [activeCall, activeChat, setActiveCall, setWaitingList]
  );

  const handleReject = useCallback(
    (call) => {
      if (!call?.roomId) return;
      const event = call.type === "chat" ? "chat:reject" : "call:reject";
      voiceSocket.emit(event, { roomId: call.roomId, rejectedBy: "ASTROLOGER" });
      setWaitingList((prev) => prev.filter((i) => i.roomId !== call.roomId));
    },
    [setWaitingList]
  );

  if (!show) return null;

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");

  return (
    <div className="wlp-overlay" onClick={onClose}>
      <div className="wlp-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="wlp-handle" />

        {/* Header */}
        <div className="wlp-header">
          <h3 className="wlp-title">Call Request</h3>
        </div>

        {/* Horizontal scrollable list */}
        <div className="wlp-list">
          {waitingList.length === 0 ? (
            <div className="wlp-empty">No incoming requests</div>
          ) : (
            waitingList.map((call) => {
              const name = getUserName(call);
              const type = call.type || "audio";
              const initials = getInitials(name);

              return (
                <div key={call._id || call.roomId} className="wlp-card">
                  <div className="wlp-card-top">
                    <div className="wlp-avatar">
                      <span>{initials}</span>
                    </div>
                    <div className="wlp-info">
                      <p className="wlp-name">{name}</p>
                      <p className="wlp-session-type">Session Type : {type === "chat" ? "Chat" : "Call"}</p>
                    </div>
                  </div>

                  <div className="wlp-actions">
                    <button
                      className="wlp-btn wlp-reject"
                      onClick={() => handleReject(call)}
                      aria-label={`Decline ${name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ transform: "rotate(135deg)" }}>
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      <span>Decline</span>
                    </button>
                    <button
                      className="wlp-btn wlp-accept"
                      onClick={() => handleAccept(call)}
                      aria-label={`Accept ${name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      <span>Start Now</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingListPanel;
