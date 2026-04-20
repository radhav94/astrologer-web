import { useEffect, useCallback, useState, useRef, memo } from "react";
import { LocalUser, RemoteUser } from "agora-rtc-react";
import { MicOff, Mic, VideoOff, Video, Send, ChevronLeft } from "lucide-react";
import { GrReactjs } from "react-icons/gr";
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
import SuggestRemedyPanel from "../../screens/private/call/SuggestRemedyPanel";
import VideoCallChat from "../../screens/private/call/VideoCallChat";
import eyeIcon from "../../assets/images/eye.png";


const LiveView = (props) => {
  const [showGifts, setShowGifts] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [coins, setCoins] = useState(106);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showWaitingList, setShowWaitingList] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isRemedyOpen, setIsRemedyOpen] = useState(false);
  const [isKundliChatOpen, setIsKundliChatOpen] = useState(false);
  const [hasUnreadKundliMessage, setHasUnreadKundliMessage] = useState(false);
  const pendingExitActionRef = useRef(null);

  const navigate = useNavigate();
  const { minimizeLive, maximizeLive, isLiveMinimized, endLiveSession, liveStartTime } = useLiveStream();
  const { waitingList, activeCall, isCallMinimized, callTimer, setActiveCall, setWaitingList, onMessagePopupClickRef } = useCall();

  // Close call-specific panels when call ends
  useEffect(() => {
    if (!activeCall) {
      setIsRemedyOpen(false);
      setIsKundliChatOpen(false);
      setHasUnreadKundliMessage(false);
    }
  }, [activeCall]);

  // Track incoming kundli/chat messages for unread dot on Kundli button
  useEffect(() => {
    if (!activeCall) return;
    const handleIncomingMessage = (data) => {
      if (!isKundliChatOpen && data.sender !== "astrologer") {
        setHasUnreadKundliMessage(true);
      }
    };
    voiceSocket.on("message:recieved", handleIncomingMessage);
    return () => voiceSocket.off("message:recieved", handleIncomingMessage);
  }, [activeCall, isKundliChatOpen]);

  // Register callback so IncomingMessagePopup opens kundli panel here instead of navigating away
  useEffect(() => {
    if (!onMessagePopupClickRef) return;
    onMessagePopupClickRef.current = () => {
      setIsRemedyOpen(false);
      setIsKundliChatOpen(true);
    };
    return () => {
      onMessagePopupClickRef.current = null;
    };
  }, [onMessagePopupClickRef]);

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
                ? `Private Call ${String(Math.floor(callTimer / 60)).padStart(2, "0")}:${String(callTimer % 60).padStart(2, "0")}`
                : `Live ${elapsedTime}`}
            </div>
          </div>
        </div>

        {activeCall && isCallMinimized && (
          <div className="top-bar-center">
            <MiniCallOverlay />
          </div>
        )}

        <div className="top-bar-right">
          {!(activeCall && isCallMinimized) && (
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
        <div className="action-item" style={{ position: "relative" }}>
          {waitingList?.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#ef4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              {waitingList.length}
            </span>
          )}
          <button
            className="action-btn"
            onClick={() => setShowWaitingList(true)}
            aria-label="View call requests"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M415.7 427.13c-8.74-76.89-43.83-108.76-69.46-132C328.52 279 320 270.61 320 256c0-14.41 8.49-22.64 26.16-38.44 25.93-23.17 61.44-54.91 69.56-132.84a47 47 0 0 0-12-36.26A50.3 50.3 0 0 0 366.39 32H145.61a50.34 50.34 0 0 0-37.39 16.46 47.05 47.05 0 0 0-11.94 36.26c8.09 77.68 43.47 109.19 69.3 132.19C183.42 232.8 192 241.09 192 256c0 15.1-8.6 23.56-26.5 39.75-25.5 23.1-60.5 54.73-69.2 131.38a46.59 46.59 0 0 0 11.7 36.2A50.44 50.44 0 0 0 145.61 480h220.78A50.44 50.44 0 0 0 404 463.33a46.59 46.59 0 0 0 11.7-36.2zM343.3 432H169.13c-15.6 0-20-18-9.06-29.16C186.55 376 240 356.78 240 326V224c0-19.85-38-35-61.51-67.2-3.88-5.31-3.49-12.8 6.37-12.8h142.73c8.41 0 10.22 7.43 6.4 12.75C310.82 189 272 204.05 272 224v102c0 30.53 55.71 47 80.4 76.87 9.95 12.04 6.47 29.13-9.1 29.13z"></path></svg>
          </button>
          <span className="action-label">Calls</span>
        </div>

        {activeCall && (
          <>
            <div className="action-item">
              <button
                className="action-btn"
                onClick={() => { setIsRemedyOpen(false); setIsKundliChatOpen(true); setHasUnreadKundliMessage(false); }}
                aria-label="View Kundli"
                style={{ position: 'relative' }}
              >
                {hasUnreadKundliMessage && (
                  <span style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    backgroundColor: '#22c55e',
                    borderRadius: '50%',
                    border: '2px solid white',
                    animation: 'pulse 2s infinite',
                  }} />
                )}
                <GrReactjs size={22} />
              </button>
              <span className="action-label">Kundli</span>
            </div>
            <div className="action-item">
              <button
                className="action-btn"
                onClick={() => { setIsKundliChatOpen(false); setIsRemedyOpen(true); }}
                aria-label="Suggest Remedy"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </button>
              <span className="action-label">Remedy</span>
            </div>
          </>
        )}
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
            const giftImg = m.giftData?.giftImg || m.giftData?.giftImage;
            const giftName = m.giftData?.giftName || "Gift";
            const giftPrice = m.giftData?.price || 0;
            const senderDisplay = m.role === "host" ? "You" : (m.senderName || "Someone");
            return (
              <div key={m.id || index} className="inline-message inline-gift-message">
                <span className="inline-initial" style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}>
                  {(m.senderName || "U").charAt(0).toUpperCase()}
                </span>
                <div className="inline-gift-card">
                  {giftImg && (
                    <img src={giftImg} alt={giftName} className="inline-gift-img" onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <div className="inline-gift-info">
                    <span className="inline-gift-sender">{senderDisplay}</span>
                    <span className="inline-gift-text">sent {giftName}</span>
                  </div>
                  {giftPrice > 0 && (
                    <span className="inline-gift-price">₹{giftPrice}</span>
                  )}
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

      {/* Kundli / Chat Panel — only during active call */}
      {activeCall && isKundliChatOpen && (
        <VideoCallChat
          isOpen={isKundliChatOpen}
          onClose={() => setIsKundliChatOpen(false)}
          hideAttachment
          videoCallData={{
            userId: activeCall.userId,
            astrologerId: activeCall.astrologerId,
            chatRoomId: activeCall.chatRoomId || activeCall.roomId,
            kundliId: activeCall.kundliId,
            isUserSide: false,
          }}
        />
      )}

      {/* Suggest Remedy Panel — only during active call */}
      <SuggestRemedyPanel
        isOpen={isRemedyOpen && !!activeCall}
        onClose={() => setIsRemedyOpen(false)}
        roomId={activeCall?.chatRoomId || activeCall?.roomId}
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
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        width: "90%",
        maxWidth: 400,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 16,
          backgroundColor: "#FFF4E3",
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
            overflow: "hidden",
          }}
        >
          {gift.giftImg ? (
            <img
              src={gift.giftImg}
              alt={gift.giftName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none"; e.target.parentNode.textContent = "🎁"; }}
            />
          ) : "🎁"}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
            🎁 {gift.senderName} sent a gift!
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666", lineHeight: 1.4 }}>
            {gift.giftName}
            {gift.price > 0 && ` • ₹${Number(gift.price).toLocaleString("en-IN")}`}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "#E85D04",
            flexShrink: 0,
          }}
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
          👤
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
            {follow.senderName} started following you!
          </p>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "#E85D04",
            flexShrink: 0,
          }}
          aria-label="Dismiss follow notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default LiveView;
