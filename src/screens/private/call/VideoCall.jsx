import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  IoMic,
  IoMicOff,
  IoVideocam,
  IoVideocamOff,
  IoArrowBack,
  IoChatbubbleEllipses,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styles from "./VideoCalling.module.scss";
import { useCall } from "../../../context/CallContext";
import { voiceSocket } from "../../../services/appServices/voiceSocketServices";

const APP_ID = "5630460abdc141e3b2f8d9597752bd7d";

const VideoCalling = ({ callData }) => {
  const { activeCall, setActiveCall } = useCall();
  const navigate = useNavigate();

  if (!activeCall || activeCall.callType !== "video") return null;

  const { roomId, agoraToken, isUserSide, callerName } = callData;

  const clientRef = useRef(null);
  const micTrackRef = useRef(null);
  const camTrackRef = useRef(null);

  const localVideoFullRef = useRef(null);
  const localVideoMiniRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const cleanupRef = useRef(false);
  const endCallRef = useRef(false);

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef(null);

  /* ================= LOCAL VIDEO ================= */
  const playLocalVideo = (container) => {
    if (!camTrackRef.current || !container) return;
    camTrackRef.current.stop();
    camTrackRef.current.play(container);
  };

  /* ================= REMOTE VIDEO ================= */
  const safePlayRemoteVideo = (track) => {
    if (!remoteVideoRef.current || !track) return;

    remoteVideoRef.current.innerHTML = "";
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    remoteVideoRef.current.appendChild(div);

    setTimeout(() => {
      try {
        track.play(div);
      } catch {
        setTimeout(() => track.play(div), 300);
      }
    }, 150);
  };

  const playRemoteAudio = (user) => {
    user?.audioTrack?.play();
  };

  const resumeAllRemoteAudio = () => {
    clientRef.current?.remoteUsers.forEach(playRemoteAudio);
  };

  /* ================= START CALL ================= */
  useEffect(() => {
    cleanupRef.current = false;
    endCallRef.current = false;

    const start = async () => {
      try {
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") safePlayRemoteVideo(user.videoTrack);
          if (mediaType === "audio") playRemoteAudio(user);
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = "";
          }
        });

        await client.join(APP_ID, roomId, agoraToken, null);

        micTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        camTrackRef.current = await AgoraRTC.createCameraVideoTrack();

        await client.publish([micTrackRef.current, camTrackRef.current]);

        setJoined(true);

        timerRef.current = setInterval(() => {
          setCallSeconds((p) => p + 1);
        }, 1000);
      } catch (err) {
        console.error("CALL START ERROR", err);
        safeEndCall();
      }
    };

    start();
    return () => cleanup();
  }, [roomId]);

  /* ================= LOCAL VIDEO ================= */
  useEffect(() => {
    if (!joined) return;
    isMinimized
      ? playLocalVideo(localVideoMiniRef.current)
      : playLocalVideo(localVideoFullRef.current);
  }, [joined, isMinimized]);

  /* ================= MIC (AUDIO ONLY – VIDEO SAFE) ================= */
  useEffect(() => {
    if (!micTrackRef.current) return;

    // 🔒 ONLY AUDIO MUTED
    micTrackRef.current.setEnabled(micOn);

    // 🛡️ DEFENSIVE: ENSURE VIDEO NEVER STOPS
    if (camTrackRef.current && cameraOn) {
      camTrackRef.current.setEnabled(true);
    }
  }, [micOn]);

  /* ================= CAMERA (VIDEO ONLY) ================= */
  useEffect(() => {
    if (!camTrackRef.current) return;
    camTrackRef.current.setEnabled(cameraOn);
  }, [cameraOn]);

  /* ================= CLEANUP ================= */
  const cleanup = async () => {
    if (cleanupRef.current) return;
    cleanupRef.current = true;

    clearInterval(timerRef.current);

    micTrackRef.current?.stop();
    micTrackRef.current?.close();
    camTrackRef.current?.stop();
    camTrackRef.current?.close();

    await clientRef.current?.leave();

    setJoined(false);
    setCallSeconds(0);
    setActiveCall(null);
  };

  /* ================= END CALL ================= */
  const safeEndCall = async () => {
    if (endCallRef.current) return;
    endCallRef.current = true;

    voiceSocket.emit("call_end", {
      roomId,
      endedBy: isUserSide ? "CUSTOMER" : "ASTROLOGER",
    });

    await cleanup();
  };

  /* ================= UI ================= */
  return (
    <>
      <div
        className={styles.videoContainer}
        onClick={resumeAllRemoteAudio}
      >
        <button
          className={styles.minimizeBtn}
          onClick={() => setIsMinimized(true)}
        >
          <IoArrowBack size={20} />
        </button>

        {!joined ? (
          <div className={styles.waitingText}>Connecting…</div>
        ) : (
          <div className={styles.videoWrapper}>
            <div ref={remoteVideoRef} className={styles.remoteVideoArea} />

            <div className={styles.localVideoPreview}>
              <div
                ref={localVideoFullRef}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div className={styles.controls}>
              <div className={styles.callInfo}>
                <span className={styles.callerName}>{callerName}</span>
                <span className={styles.callTimer}>
                  ⏱ {Math.floor(callSeconds / 60)}:
                  {String(callSeconds % 60).padStart(2, "0")}
                </span>
              </div>

              <div className={styles.controlButtons}>
                <button
                  className={styles.iconBtn}
                  onClick={() => setMicOn((p) => !p)}
                >
                  {micOn ? <IoMic size={22} /> : <IoMicOff size={22} />}
                </button>

                <button
                  className={styles.iconBtn}
                  onClick={() => setCameraOn((p) => !p)}
                >
                  {cameraOn ? (
                    <IoVideocam size={22} />
                  ) : (
                    <IoVideocamOff size={22} />
                  )}
                </button>

                <button
                  className={`${styles.iconBtn} ${styles.endBtn}`}
                  onClick={safeEndCall}
                >
                  End
                </button>

                <button
                  className={styles.iconBtn}
                  onClick={() => setIsMinimized(true)}
                >
                  <IoChatbubbleEllipses size={22} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VideoCalling;
