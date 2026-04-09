import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, X } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { useLiveStream } from "../../context/LiveStreamContext";
import { useCall } from "../../context/CallContext";
import { useChat as useChatContext } from "../../context/chatContext";
import { Toast } from "../../components";
import "./styles/livePreview.scss";

const LivePreview = () => {
  const navigate = useNavigate();
  const { isLive, endLiveSession } = useLiveStream();
  const { activeCall } = useCall();
  const { activeChat } = useChatContext();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [hasPermission, setHasPermission] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);

  // If we're on the preview page, we're not actually live.
  // Clear any stale sessionStorage flag from a previous session.
  useEffect(() => {
    if (isLive) {
      endLiveSession();
    }
  }, []); // Run once on mount only

  const stopAllTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const attachStream = useCallback((stream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startPreview = async () => {
      stopAllTracks();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        attachStream(stream);
        setHasPermission(true);
      } catch {
        if (!cancelled) {
          setHasPermission(false);
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      }
    };

    startPreview();

    return () => {
      cancelled = true;
      stopAllTracks();
    };
  }, [stopAllTracks, attachStream]);

  const hasActiveSession = Boolean(activeCall || activeChat);

  const handleGoLive = () => {
    if (isLive) {
      Toast.warn("You already have an ongoing live session");
      return;
    }
    if (hasActiveSession) {
      Toast.warn("Please end your current consultation before going live");
      return;
    }
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    stopAllTracks();
    navigate("/astrologer-dashboard/live-streaming", {
      state: { micOn: true, cameraOn: true },
    });
  };

  const handleCountdownCancel = () => {
    setShowCountdown(false);
  };

  const handleClose = () => {
    stopAllTracks();
    navigate("/dashboard");
  };

  return (
    <div className="live-preview-fullscreen">
      {/* Camera feed as background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="preview-bg-video"
      />

      {/* Dark gradient overlay */}
      <div className="preview-overlay" />

      {/* Preview badge — top right */}
      <div className="preview-badge">
        <Eye size={14} />
        <span>Preview</span>
      </div>

      {/* Close button — top left */}
      <button
        className="preview-close-btn"
        onClick={handleClose}
        aria-label="Close preview"
      >
        <X size={20} />
      </button>

      {/* Center content */}
      <div className="preview-center">
        <h1 className="preview-title">Ready to connect?</h1>
        <p className="preview-subtitle">
          Going live will allow users to join your session instantly.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="preview-bottom">
        {hasPermission === false && (
          <p className="permission-warning">
            Camera/Mic permission denied. Please allow access in browser settings.
          </p>
        )}
        <p className="preview-hint">Click here to start</p>
        <button
          className="go-live-btn"
          onClick={handleGoLive}
          disabled={hasPermission === false || showCountdown || isLive || hasActiveSession}
        >
          {isLive ? "Already Live" : hasActiveSession ? "In Consultation" : "Go Live"}
        </button>
      </div>

      {showCountdown && (
        <CountdownTimer
          onComplete={handleCountdownComplete}
          onCancel={handleCountdownCancel}
        />
      )}
    </div>
  );
};

export default LivePreview;
