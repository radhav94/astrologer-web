import { useCall } from "../../context/CallContext";
import { IoCallSharp } from "react-icons/io5";
import "./MiniCallOverlay.scss";

const MiniCallOverlay = () => {
  const { activeCall, isCallMinimized } = useCall();

  if (!activeCall || !isCallMinimized) return null;

  const callerName = activeCall.callerName || "User";
  const initials = callerName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className="mini-call-overlay">
      <div className="mini-call-avatar">
        <span>{initials}</span>
      </div>
      <button
        className="mini-call-end"
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent("mini-call-end"));
        }}
        aria-label="End call"
      >
        <IoCallSharp size={12} style={{ transform: "rotate(135deg)" }} />
      </button>
    </div>
  );
};

export default MiniCallOverlay;
