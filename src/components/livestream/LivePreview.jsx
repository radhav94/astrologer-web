import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import "./styles/livePreview.scss";

const LivePreview = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

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

  // Acquire media stream whenever camera/mic toggles
  useEffect(() => {
    let cancelled = false;

    const startPreview = async () => {
      // Stop previous stream first
      stopAllTracks();

      // Need at least one track requested
      if (!cameraOn && !micOn) {
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }

      try {
        const constraints = {};
        if (cameraOn) constraints.video = true;
        if (micOn) constraints.audio = true;

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

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
  }, [cameraOn, micOn, stopAllTracks, attachStream]);

  // Audio level meter
  useEffect(() => {
    const stream = streamRef.current;
    if (!micOn || !stream || stream.getAudioTracks().length === 0) {
      setAudioLevel(0);
      return;
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(Math.min(avg / 128, 1));
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioCtx.close();
    };
  }, [micOn, cameraOn]); // re-run when stream changes via toggle

  const handleGoLive = () => {
    stopAllTracks();
    navigate("/astrologer-dashboard/live-streaming", {
      state: { micOn, cameraOn },
    });
  };

  const handleBack = () => {
    stopAllTracks();
    navigate("/dashboard");
  };

  return (
    <div className="live-preview">
      <div className="preview-card">
        <div className="preview-video-wrapper">
          {/* Always mounted so ref stays stable */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="preview-video"
            style={{ display: cameraOn ? "block" : "none" }}
          />

          {!cameraOn && (
            <div className="camera-off-placeholder">
              <span className="camera-off-icon">📷</span>
              <p>Camera is off</p>
            </div>
          )}

          {micOn && (
            <div className="audio-indicator">
              <div
                className="audio-bar"
                style={{ height: `${audioLevel * 100}%` }}
              />
              <div
                className="audio-bar"
                style={{ height: `${Math.min(audioLevel * 130, 100)}%` }}
              />
              <div
                className="audio-bar"
                style={{ height: `${audioLevel * 80}%` }}
              />
            </div>
          )}
        </div>

        <div className="preview-controls">
          <button
            className={`preview-ctrl-btn ${micOn ? "active" : ""}`}
            onClick={() => setMicOn((v) => !v)}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            <span>{micOn ? "Mic On" : "Mic Off"}</span>
          </button>
          <button
            className={`preview-ctrl-btn ${cameraOn ? "active" : ""}`}
            onClick={() => setCameraOn((v) => !v)}
          >
            {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
            <span>{cameraOn ? "Camera On" : "Camera Off"}</span>
          </button>
        </div>

        {hasPermission === false && (
          <p className="permission-warning">
            Camera/Mic permission denied. Please allow access in your browser
            settings.
          </p>
        )}

        <p className="preview-hint">
          Check your video and audio before going live. Your audience will see
          exactly what you see here.
        </p>

        <div className="preview-actions">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
          <button
            className="go-live-btn"
            onClick={handleGoLive}
            disabled={hasPermission === false}
          >
            🔴 Start Live Streaming
          </button>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
