import { useEffect, useCallback, useState, useRef, memo } from "react";
import { LocalUser, RemoteUser } from "agora-rtc-react";
import { MicOff, Mic, VideoOff, Video, Send, ChevronLeft } from "lucide-react";
import "./styles/videoBox.scss";
import { useLiveViewLogic } from "./useLiveViewLogic";
import GiftPopup from "./GiftPopup";
import CallRequestPopup from "./CallRequestPopup";
import SharePopup from "./SharePopup";
import IncomingWaitingNotification from "./IncomingWaitingNotification";
import WaitingListPanel from "./WaitingListPanel";
import ExitConfirmationModal from "./ExitConfirmationModal";
import MiniCallOverlay from "./MiniCallOverlay";
import { Toast } from "../../components";
import { stopLiveStream } from "../../services/appServices/authservice";
import { voiceSocket } from "../../services/appServices/voiceSocketServices";
import { getUserFromStorage } from "../../utils/authStorage";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDefaultImgBasedOnGender } from "../../utils/utils";
import { useLiveStream } from "../../context/LiveStreamContext";
import { useCall } from "../../context/CallContext";
import eyeIcon from "../../assets/images/eye.png";


const LiveView = (props) => {
  const [showGifts, setShowGifts] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [coins, setCoins] = useState(106);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showWaitingList, setShowWaitingList] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const pendingExitActionRef = useRef(null);

  const navigate = useNavigate();
  const { minimizeLive, maximizeLive, isLiveMinimized, endLiveSession, liveStartTime } = useLiveStream();
  const { waitingList, activeCall, isCallMinimized, callTimer, setActiveCall, setWaitingList } = useCall();

  const user = getUserFromStorage();
  const astrologerDetails = useSelector((state) => state.register.astrologerDetails);
  const astrologerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Astrologer Live";
  const profileImage = astrologerDetails?.profileImgUrl || getDefaultImgBasedOnGender(astrologerDetails?.gender);

  const hasEndedRef = useRef(false);
  const isMountedRef = useRef(false);
  const messagesOverlayRef = useRef(null);

  // Elapsed live time
  const [elapsedTime, setElapsedTime] = useState("0 s");

  useEffect(() => {
    if (!liveStartTime) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - liveStartTime) / 1000);
      const hrs = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      if (hrs > 0) {
        setElapsedTime(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      } else {
        setElapsedTime(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [liveStartTime]);

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
    giftNotification,
    dismissGiftNotification,
    followNotification,
    dismissFollowNotification,
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

      // Cancel active call if any
      if (activeCall?.roomId) {
        voiceSocket.emit("call:end", { roomId: activeCall.roomId, endedBy: "ASTROLOGER" });
        setActiveCall(null);
      }

      // Reject all waiting calls
      if (waitingList?.length > 0) {
        waitingList.forEach((call) => {
          if (call?.roomId) {
            const event = call.type === "chat" ? "chat:reject" : "call:reject";
            voiceSocket.emit(event, { roomId: call.roomId, rejectedBy: "ASTROLOGER" });
          }
        });
        setWaitingList([]);
      }

      await stopLiveStream(channelName);
      clearLiveSession?.();
      endLiveSession();
      Toast.success("Live ended successfully");
      navigate("/astrologer-dashboard", { replace: true });
    } catch (e) {
      Toast.error("Unable to end live");
    } finally {
      setCalling(false);
    }
  }, [ROLE, channelName, setCalling, setCamera, setMic, navigate, endRoom, clearLiveSession, endLiveSession, activeCall, waitingList, setActiveCall, setWaitingList]);

  const endLiveSafely = useCallback(async () => {
    if (ROLE !== "host") return;
    if (hasEndedRef.current) return;

    hasEndedRef.current = true;

    try {
      setCamera(false);
      setMic(false);
      endRoom?.();

      // Cancel active call if any
      if (activeCall?.roomId) {
        voiceSocket.emit("call:end", { roomId: activeCall.roomId, endedBy: "ASTROLOGER" });
        setActiveCall(null);
      }

      // Reject all waiting calls
      if (waitingList?.length > 0) {
        waitingList.forEach((call) => {
          if (call?.roomId) {
            const event = call.type === "chat" ? "chat:reject" : "call:reject";
            voiceSocket.emit(event, { roomId: call.roomId, rejectedBy: "ASTROLOGER" });
          }
        });
        setWaitingList([]);
      }

      await stopLiveStream(channelName);
      clearLiveSession?.();
      endLiveSession();
      Toast.success("Live ended");
    } catch (e) {
      console.error("Failed to end live", e);
    } finally {
      setCalling(false);
    }
  }, [ROLE, channelName, setCalling, setCamera, setMic, endRoom, clearLiveSession, endLiveSession, activeCall, waitingList, setActiveCall, setWaitingList]);

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

  /* ================= EXIT CONFIRMATION FLOW ================= */
  // Ask for confirmation instead of navigating directly
  const requestExit = useCallback((action) => {
    if (ROLE !== "host") {
      // Non-host viewers can leave freely
      action?.();
      return;
    }
    pendingExitActionRef.current = action || null;
    setShowExitConfirm(true);
  }, [ROLE]);

  const handleStay = useCallback(() => {
    pendingExitActionRef.current = null;
    setShowExitConfirm(false);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    pendingExitActionRef.current = null;
    handleEndLive();
  }, [handleEndLive]);

  // Block browser back button / swipe-back with confirmation
  useEffect(() => {
    if (ROLE !== "host") return;

    // Push a guard entry so pressing back triggers popstate instead of leaving
    window.history.pushState({ liveGuard: true }, "");

    const onPopState = (e) => {
      // Re-push the guard so repeated back presses keep showing the modal
      window.history.pushState({ liveGuard: true }, "");
      setShowExitConfirm(true);
      pendingExitActionRef.current = () => {
        // Remove the guard entry and actually go back
        window.history.go(-1);
      };
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [ROLE]);

  // Block tab close / refresh with native browser prompt
  useEffect(() => {
    if (ROLE !== "host") return;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [ROLE]);

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
          onClick={() => requestExit()}
          aria-label="Exit live"
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
            <div className="host-live-timer">
              <span className="host-live-dot" />
              {activeCall && isCallMinimized
                ? `Call ${String(Math.floor(callTimer / 60)).padStart(2, "0")}:${String(callTimer % 60).padStart(2, "0")}`
                : `Live ${elapsedTime}`}
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          {activeCall && isCallMinimized ? (
            <MiniCallOverlay />
          ) : (
            <div className="live-badge">
              <span className="live-badge-dot" />
              LIVE
            </div>
          )}
          <div className="viewer-pill">
            <img src={eyeIcon} alt="viewers" className="viewer-icon" />
            <span className="viewer-count">{viewerCount >= 1000 ? `${(viewerCount / 1000).toFixed(1)}k` : viewerCount}</span>
          </div>
          <button
            className="close-live-btn"
            onClick={isHost ? () => requestExit() : () => navigate(-1)}
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
            videoTrack={localCameraTrack}
            cameraOn={cameraOn}
            micOn={micOn && !isMicMutedByCall}
            playAudio={false}
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
            onClick={() => setShowWaitingList(true)}
            aria-label="View call requests"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-inbound" viewBox="0 0 16 16">
              <path d="M15.854.146a.5.5 0 0 1 0 .708L11.707 5H14.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 1 0v2.793L15.146.146a.5.5 0 0 1 .708 0m-12.2 1.182a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
            </svg>
          </button>
          <span className="action-label">Calls</span>
        </div>

        {/* <div className="action-item">
          <div className="action-btn action-btn-static" aria-label="Live duration">
            <Timer size={24} strokeWidth={1.5} />
          </div>
          <span className="action-label">{elapsedTime}</span>
        </div> */}

      </div>

      {/* Inline Messages Overlay */}
      <div className="inline-messages-overlay" ref={messagesOverlayRef}>
        {messages.map((m, index) => {
          // System messages (join/leave) — same circle with first letter as regular messages
          if (m.type === "join" || m.type === "leave") {
            return (
              <div key={m.id || index} className="inline-message" style={{ opacity: 0.7 }}>
                <span className="inline-initial">
                  {(m.senderName || "U").charAt(0).toUpperCase()}
                </span>
                <div className="inline-message-body">
                  <span className="inline-text" style={{ fontStyle: "italic", fontSize: 12 }}>{m.text}</span>
                </div>
              </div>
            );
          }

          // Gift messages
          if (m.type === "gift") {
            return (
              <div key={m.id || index} className="inline-message inline-gift-message">
                <span className="inline-initial" style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}>
                  🎁
                </span>
                <div className="inline-message-body">
                  {m.senderName && (
                    <span className="inline-sender" style={{ color: "#f75801" }}>
                      {m.role === "host" ? "You" : m.senderName}
                    </span>
                  )}
                  <span className="inline-text">{m.text}</span>
                </div>
              </div>
            );
          }

          // Follow messages
          if (m.type === "follow") {
            return (
              <div key={m.id || index} className="inline-message inline-gift-message">
                <span className="inline-initial" style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}>
                  👤
                </span>
                <div className="inline-message-body">
                  {m.senderName && (
                    <span className="inline-sender" style={{ color: "#f75801" }}>
                      {m.senderName}
                    </span>
                  )}
                  <span className="inline-text">{m.text}</span>
                </div>
              </div>
            );
          }

          // Regular messages
          return (
            <div
              key={m.id || index}
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
          );
        })}
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

      {/* Gift Received Notification */}
      <LiveGiftNotification gift={giftNotification} onDismiss={dismissGiftNotification} />

      {/* Follow Notification */}
      <LiveFollowNotification follow={followNotification} onDismiss={dismissFollowNotification} />

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

      {/* Waiting list notification (calls/chats arriving while live) */}
      <IncomingWaitingNotification />

      {/* Waiting list panel */}
      <WaitingListPanel
        show={showWaitingList}
        onClose={() => setShowWaitingList(false)}
      />

      {/* Exit confirmation */}
      <ExitConfirmationModal
        show={showExitConfirm}
        onStay={handleStay}
        onExit={handleConfirmExit}
      />
    </div>
  );
};

const LiveGiftNotification = memo(({ gift, onDismiss }) => {
  if (!gift) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        width: "90%",
        maxWidth: 380,
        pointerEvents: "auto",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20"
        style={{ background: "linear-gradient(135deg, rgba(247,88,1,0.95), rgba(212,52,0,0.95))" }}
      >
        {gift.giftImg && (
          <img
            src={gift.giftImg}
            alt={gift.giftName}
            className="w-12 h-12 object-contain rounded-lg bg-white/20 p-1 flex-shrink-0"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-white text-sm font-bold">
            🎁 {gift.senderName} sent a gift!
          </span>
          <span className="text-white/80 text-xs">
            {gift.giftName}
            {gift.price > 0 && ` • ₹${Number(gift.price).toLocaleString("en-IN")}`}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="ml-1 text-white/70 hover:text-white flex-shrink-0"
          aria-label="Dismiss gift notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

const LiveFollowNotification = memo(({ follow, onDismiss }) => {
  if (!follow) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        width: "90%",
        maxWidth: 380,
        pointerEvents: "auto",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20"
        style={{ background: "linear-gradient(135deg, rgba(247,88,1,0.95), rgba(212,52,0,0.95))" }}
      >
        <span className="text-2xl flex-shrink-0">👤</span>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-white text-sm font-bold">
             {follow.senderName} started following you!
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="ml-1 text-white/70 hover:text-white flex-shrink-0"
          aria-label="Dismiss follow notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default LiveView;
