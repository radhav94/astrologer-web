import { useCall } from "../../context/CallContext";
import { IoCallSharp } from "react-icons/io5";
import "./MiniCallOverlay.scss";

const MiniCallOverlay = () => {
  const { activeCall, isCallMinimized, callTimer } = useCall();

  if (!activeCall || !isCallMinimized) return null;

  const callerName = activeCall.callerName || "User";
  const initials = callerName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="mini-call-overlay">
      {/* Avatar with initials */}
      <div className="mini-call-avatar">
        <span>{initials}</span>
      </div>

      {/* Timer */}
      <span className="mini-call-timer">{formatTime(callTimer)}</span>

      {/* End call */}
      <button
        className="mini-call-end"
        onClick={(e) => {
          e.stopPropagation();
          // Dispatch a custom event that VoiceCall/VideoCall can listen to
          window.dispatchEvent(new CustomEvent("mini-call-end"));
        }}
        aria-label="End call"
      >
        <IoCallSharp size={16} style={{ transform: "rotate(135deg)" }} />
      </button>
    </div>
  );
};

export default MiniCallOverlay;
