import { useState, useEffect, useCallback } from "react";
import { useCall } from "../../context/CallContext";
import { IoCallSharp, IoMic, IoMicOff } from "react-icons/io5";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import "./MiniCallOverlay.scss";

const MiniCallOverlay = () => {
  const { activeCall, isCallMinimized, callTimer } = useCall();
  const [expanded, setExpanded] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);

  // Sync mic/speaker state from VoiceCall via custom events
  useEffect(() => {
    const onMicSync = (e) => setMicOn(e.detail);
    const onSpeakerSync = (e) => setSpeakerOn(e.detail);
    window.addEventListener("mini-call-mic-sync", onMicSync);
    window.addEventListener("mini-call-speaker-sync", onSpeakerSync);
    return () => {
      window.removeEventListener("mini-call-mic-sync", onMicSync);
      window.removeEventListener("mini-call-speaker-sync", onSpeakerSync);
    };
  }, []);

  const toggleMic = useCallback((e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("mini-call-toggle-mic"));
  }, []);

  const toggleSpeaker = useCallback((e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("mini-call-toggle-speaker"));
  }, []);

  const endCall = useCallback((e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("mini-call-end"));
  }, []);

  if (!activeCall || !isCallMinimized) return null;

  const callerName = activeCall.callerName || "Caller";
  const initials = callerName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <>
      {/* Collapsed mini pill */}
      {!expanded && (
        <div className="mini-call-overlay" onClick={() => setExpanded(true)}>
          <div className="mini-call-avatar">
            <span>{initials}</span>
          </div>
          <button className="mini-call-end" onClick={endCall} aria-label="End call">
            <IoCallSharp size={12} style={{ transform: "rotate(135deg)" }} />
          </button>
        </div>
      )}

      {/* Expanded call card */}
      {expanded && (
        <div className="expanded-call-card">
          <button
            className="expanded-call-collapse"
            onClick={() => setExpanded(false)}
            aria-label="Collapse"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f75801" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="expanded-call-info">
            <span className="expanded-call-name">
              {callerName.length > 14 ? callerName.slice(0, 14) + "..." : callerName}
            </span>
            <span className="expanded-call-timer">{formatTime(callTimer)}</span>
          </div>

          <div className="expanded-call-actions">
            <button
              className={`expanded-call-action-btn ${!micOn ? "off" : ""}`}
              onClick={toggleMic}
              aria-label={micOn ? "Mute mic" : "Unmute mic"}
            >
              {micOn ? <IoMic size={16} /> : <IoMicOff size={16} />}
            </button>
            <button
              className={`expanded-call-action-btn ${!speakerOn ? "off" : ""}`}
              onClick={toggleSpeaker}
              aria-label={speakerOn ? "Mute speaker" : "Unmute speaker"}
            >
              {speakerOn ? <HiSpeakerWave size={16} /> : <HiSpeakerXMark size={16} />}
            </button>
            <button
              className="expanded-call-action-btn end"
              onClick={endCall}
              aria-label="End call"
            >
              <IoCallSharp size={16} style={{ transform: "rotate(135deg)" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MiniCallOverlay;
