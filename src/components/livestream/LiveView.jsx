import { useEffect, useCallback, useState, useRef } from "react";
import { LocalUser, RemoteUser } from "agora-rtc-react";
import { MicOff, Mic, VideoOff, Video, Send, Timer, Gift, ChevronLeft } from "lucide-react";
import "./styles/videoBox.scss";
import { useLiveViewLogic } from "./useLiveViewLogic";
import GiftPopup from "./GiftPopup";
import CallRequestPopup from "./CallRequestPopup";
import SharePopup from "./SharePopup";
import { Toast } from "../../components";
import { stopLiveStream } from "../../services/appServices/authservice";
import { getUserFromStorage } from "../../utils/authStorage";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDefaultImgBasedOnGender } from "../../utils/utlis";
import { useLiveStream } from "../../context/LiveStreamContext";
import eyeIcon from "../../assets/images/eye.png";


const LiveView = (props) => {
  const [showGifts, setShowGifts] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [coins, setCoins] = useState(106);
  const [showCallPopup, setShowCallPopup] = useState(false);

  const navigate = useNavigate();
  const { minimizeLive, maximizeLive, isLiveMinimized } = useLiveStream();

  const user = getUserFromStorage();
  const astrologerDetails = useSelector((state) => state.register.astrologerDetails);
  const astrologerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Astrologer Live";
  const profileImage = astrologerDetails?.profileImgUrl || getDefaultImgBasedOnGender(astrologerDetails?.gender);

  const hasEndedRef = useRef(false);
  const isMountedRef = useRef(false);
  const messagesOverlayRef = useRef(null);

  const hostData = {
    name: "Anaisha",
    image: "/host-profile.jpg",
    rate: 32,
  };

  const giftList = [
    { id: 1, name: "Flowers", price: 15, icon: "💐" },
    { id: 2, name: "Pooja Thali", price: 21, icon: "🪔" },
    { id: 3, name: "Heart", price: 21, icon: "❤️" },
    { id: 4, name: "Chocolates", price: 51, icon: "🍫" },
    { id: 5, name: "Sweets", price: 101, icon: "🍬" },
    { id: 6, name: "Magician", price: 101, icon: "🪄" },
    { id: 7, name: "Shivling", price: 251, icon: "🕉️" },
    { id: 8, name: "Crown", price: 501, icon: "👑" },
    { id: 9, name: "Dakshina", price: 2100, icon: "🙏" },
    { id: 10, name: "Ganesha", price: 5100, icon: "🐘" },
  ];

  const {
    ROLE,
    isConnected,
    localMicrophoneTrack,
    localCameraTrack,
    remoteUsers,
    micOn,
    setMic,
    cameraOn,
    setCamera,
    setCalling,
    messages,
    chatInput,
    setChatInput,
    channelName,
    participantCount,
    endRoom,
    clearLiveSession,
    isMicMutedByCall,
  } = props;

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesOverlayRef.current) {
      messagesOverlayRef.current.scrollTop = messagesOverlayRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleEndLive = useCallback(async () => {
    if (ROLE !== "host") return;

    try {
      setCamera(false);
      setMic(false);
      endRoom?.();
      await stopLiveStream(channelName);
      clearLiveSession?.();
      Toast.success("Live ended successfully");
      navigate("/astrologer-dashboard", { replace: true });
    } catch (e) {
      Toast.error("Unable to end live");
    } finally {
      setCalling(false);
    }
  }, [ROLE, channelName, setCalling, setCamera, setMic, navigate, endRoom, clearLiveSession]);

  const endLiveSafely = useCallback(async () => {
    if (ROLE !== "host") return;
    if (hasEndedRef.current) return;

    hasEndedRef.current = true;

    try {
      setCamera(false);
      setMic(false);
      endRoom?.();
      await stopLiveStream(channelName);
      clearLiveSession?.();
      Toast.success("Live ended");
    } catch (e) {
      console.error("Failed to end live", e);
    } finally {
      setCalling(false);
    }
  }, [ROLE, channelName, setCalling, setCamera, setMic, endRoom, clearLiveSession]);

  const isHost = ROLE === "host";
  const viewerCount = participantCount || (remoteUsers?.length || 0) + 1;

  const handleMinimize = useCallback(() => {
    minimizeLive({
      astrologerName,
      profileImage,
      viewerCount,
      channelName,
      endRoom,
      clearLiveSession,
    });
    navigate("/dashboard", { replace: true });
  }, [minimizeLive, astrologerName, profileImage, viewerCount, channelName, endRoom, clearLiveSession, navigate]);

  const {
    messagesEndRef,
    showSharePopup,
    setShowSharePopup,
    handleSend,
    handleCopyLink,
    shareToWhatsapp,
    shareToGmail,
    shareToFacebook,
    shareToPinterest,
  } = useLiveViewLogic(props);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="video-box">
      {/* TOP BAR */}
      <div className="top-bar">
        <button
          className="back-btn"
          onClick={handleMinimize}
          aria-label="Minimize live"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <div className="host-info">
          <div className="host-avatar">
            <img
              src={profileImage}
              alt={astrologerName}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              onError={(e) => { e.target.style.display = "none"; e.target.parentNode.textContent = "🕉️"; }}
            />
          </div>
          <div>
            <div className="host-name">{astrologerName}</div>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="live-badge">
            <span className="live-badge-dot" />
            LIVE
          </div>
          <div className="viewer-pill">
            <img src={eyeIcon} alt="viewers" className="viewer-icon" />
            <span className="viewer-count">{viewerCount >= 1000 ? `${(viewerCount / 1000).toFixed(1)}k` : viewerCount}</span>
          </div>
          <button
            className="close-live-btn"
            onClick={isHost ? handleEndLive : () => navigate(-1)}
            aria-label="Close live"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="reel-container">
        {isHost && isConnected && (
          <LocalUser
            audioTrack={localMicrophoneTrack}
            videoTrack={localCameraTrack}
            cameraOn={cameraOn}
            micOn={micOn && !isMicMutedByCall}
          />
        )}

        {!isHost &&
          remoteUsers.map((user) => <RemoteUser key={user.uid} user={user} />)}

        {!isHost && remoteUsers.length === 0 && (
          <div className="waiting-text">Waiting for astrologer…</div>
        )}
      </div>

      {/* RIGHT FLOATING ACTION BUTTONS */}
      <div className="right-action-bar">
        <div className="action-item">
          <button
            className="action-btn"
            onClick={() => setShowCallPopup(true)}
            aria-label="Request call"
          >
            <Timer size={24} strokeWidth={1.5} />
          </button>
          <span className="action-label">20 m</span>
        </div>

        <div className="action-item">
          <button
            className="action-btn"
            onClick={() => setShowGifts(true)}
            aria-label="Send gift"
          >
             <Gift size={24} strokeWidth={1.5} />
          </button>
          <span className="action-label">Gift</span>
          <span className="action-label">13</span>
        </div>
      </div>

      {/* Inline Messages Overlay */}
      <div className="inline-messages-overlay" ref={messagesOverlayRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`inline-message ${m.role === "host" ? "inline-host-message" : ""}`}
          >
            <span className="inline-initial">
              {(m.senderName || (m.role === "host" ? "A" : "U")).charAt(0).toUpperCase()}
            </span>
            <div className="inline-message-body">
              {m.senderName && (
                <span className="inline-sender">
                  {m.role === "host" ? "You" : m.senderName}
                </span>
              )}
              <span className="inline-text">{m.text}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM COMPOSER */}
      <form className="chat-composer" onSubmit={handleSend}>
        <div className="composer-pill">
          <input
            type="text"
            placeholder="Starts typing..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />

          {isHost && (
            <>
              <button
                type="button"
                className={`composer-icon-btn mic-btn ${(!micOn || isMicMutedByCall) ? "active" : ""}`}
                onClick={() => !isMicMutedByCall && setMic((v) => !v)}
                disabled={isMicMutedByCall}
                aria-label={
                  isMicMutedByCall
                    ? "Microphone muted during call"
                    : micOn
                      ? "Mute microphone"
                      : "Unmute microphone"
                }
                title={isMicMutedByCall ? "Mic is off during active call" : ""}
              >
                {(micOn && !isMicMutedByCall) ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                type="button"
                className={`composer-icon-btn video-btn ${!cameraOn ? "active" : ""}`}
                onClick={() => setCamera((v) => !v)}
                aria-label={cameraOn ? "Hide camera" : "Show camera"}
              >
                {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            </>
          )}

          <button
            type="submit"
            className="composer-icon-btn send-btn"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* POPUPS */}
      <GiftPopup
        show={showGifts}
        onClose={() => setShowGifts(false)}
        giftList={giftList}
        coins={coins}
        selectedGift={selectedGift}
        setSelectedGift={setSelectedGift}
        onSend={() => {
          Toast.success("Gift Sent!");
          setShowGifts(false);
        }}
      />
      <SharePopup
        show={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        url={window.location.href}
        shareToWhatsapp={shareToWhatsapp}
        shareToGmail={shareToGmail}
        handleCopyLink={handleCopyLink}
      />
      <CallRequestPopup
        show={showCallPopup}
        onClose={() => setShowCallPopup(false)}
        onJoin={() => {
          setShowCallPopup(false);
          alert("Private Call starting soon...");
        }}
        host={hostData}
      />
    </div>
  );
};

export default LiveView;
