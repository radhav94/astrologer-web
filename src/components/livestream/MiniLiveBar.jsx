import { useNavigate } from "react-router-dom";
import { useLiveStream } from "../../context/LiveStreamContext";
import { X, Radio } from "lucide-react";
import { stopLiveStream } from "../../services/appServices/authservice";
import { Toast } from "../../components";
import "./MiniLiveBar.scss";

const MiniLiveBar = () => {
  const navigate = useNavigate();
  const { isLiveMinimized, liveMetadata, maximizeLive, endLiveSession } = useLiveStream();

  if (!isLiveMinimized || !liveMetadata) return null;

  const handleResume = () => {
    maximizeLive();
    navigate("/astrologer-dashboard/live-streaming");
  };

  const handleEndLive = async () => {
    try {
      if (liveMetadata.channelName) {
        await stopLiveStream(liveMetadata.channelName);
      }
      liveMetadata.endRoom?.();
      liveMetadata.clearLiveSession?.();
      endLiveSession();
      sessionStorage.removeItem("shubhtalk_live_session");
      sessionStorage.removeItem("shubhtalk_live_chat_room");
      sessionStorage.removeItem("shubhtalk_live_chat_messages");
      Toast.success("Live ended");
    } catch (e) {
      Toast.error("Unable to end live");
    }
  };

  return (
    <div className="mini-live-bar" onClick={handleResume}>
      <div className="mini-live-left">
        <div className="mini-live-avatar">
          <img
            src={liveMetadata.profileImage}
            alt={liveMetadata.astrologerName}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentNode.textContent = "🕉️";
            }}
          />
        </div>
        <span className="mini-live-name">{liveMetadata.astrologerName}</span>
      </div>

      <div className="mini-live-right">
        <div className="mini-live-badge">
          <span className="mini-live-dot" />
          LIVE
        </div>
        <div className="mini-live-viewers">
          <span>👁</span>
          <span>{liveMetadata.viewerCount >= 1000 ? `${(liveMetadata.viewerCount / 1000).toFixed(1)}k` : liveMetadata.viewerCount}</span>
        </div>
        <button
          className="mini-live-close"
          onClick={(e) => {
            e.stopPropagation();
            handleEndLive();
          }}
          aria-label="End live"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default MiniLiveBar;
