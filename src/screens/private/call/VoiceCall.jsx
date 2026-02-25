import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  IoMic,
  IoMicOff,
  IoArrowBack,
  IoChatbubbleEllipses,
  IoVideocam,
  IoVideocamOff
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styles from "./VoiceCall.module.scss";
// import { voiceSocket } from "../../services/voiceSocketServices";
// import { useCall } from "../../context/CallContext";
// import { PATH } from "../../utils/routes/Paths";
import { useCall } from "../../../context/CallContext";
import { voiceSocket } from "../../../services/appServices/voiceSocketServices";
import { PATH } from "../../../utils/routes/Paths";

const APP_ID = "c76e3d30a3b6483689dac88ca9f94381";

const AgoraVoiceCalling = ({ callData }) => {
  const { activeCall, setActiveCall, sharedAgoraState, setSharedAgoraState, isUpgradeRejectionProtected, upgradeRejectionRef } = useCall();
  const navigate = useNavigate();

  if (!activeCall || activeCall.callType !== "audio") return null;

  const { roomId, agoraToken, callerName, isUserSide } = callData;

  /* ================= REFS ================= */
  const clientRef = useRef(null);
  const micTrackRef = useRef(null);
  const cleanupRef = useRef(false);
  const videoTrackRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const isUpgradingRef = useRef(false); // Track if upgrading to video

  /* ================= STATE ================= */
  const [micOn, setMicOn] = useState(true);
  const [joined, setJoined] = useState(false);
  const [callState, setCallState] = useState("connecting");
  const [timer, setTimer] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isVideo, setIsVideo] = useState(false);
  const [isRemoteVideo, setIsRemoteVideo] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);

  /* ================= START CALL ================= */
  useEffect(() => {
    cleanupRef.current = false;

    const startCall = async () => {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }

        if (mediaType === "video") {
          setIsRemoteVideo(true)
          user.videoTrack?.play(remoteVideoRef.current);
        }
      });

      client.on("user-unpublished", async (user, mediaType) => {
        if (mediaType === "video") {
          setIsRemoteVideo(false)
        }
      });

      client.on("user-left", (user) => {
        console.log("👤 User left Agora channel:", user.uid);
        // Check protection before ending call
        if (upgradeRejectionRef.current) {
          console.log("⚠️ Ignoring user-left - upgrade rejection protection is active");
          return;
        }
        console.log("📞 Processing user-left - ending call");
        endCall();
      });

      await client.join(APP_ID, roomId, agoraToken, "");

      micTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([micTrackRef.current]);

      // Store in shared state for potential upgrade
      setSharedAgoraState({
        client: client,
        micTrack: micTrackRef.current,
        cameraTrack: null,
        isUpgrading: false
      });

      setJoined(true);
      setCallState("connected");
    };

    startCall();

    return () => {
      // Check ref value at unmount time
      if (!isUpgradingRef.current) {
        cleanup();
      } else {
        console.log("🔄 Skipping cleanup - upgrading to video");
      }
    };
    // eslint-disable-next-line
  }, [roomId]);
  
  /* ================= WATCH FOR UPGRADE ================= */
  useEffect(() => {
    isUpgradingRef.current = sharedAgoraState.isUpgrading;
  }, [sharedAgoraState.isUpgrading]);

  /* ================= MIC TOGGLE ================= */
  useEffect(() => {
    micTrackRef.current?.setEnabled(micOn);
  }, [micOn]);

  /* ================= TIMER ================= */
  useEffect(() => {
    let interval;
    if (callState === "connected") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  /* ================= CLEANUP ================= */
  const cleanup = async () => {
    if (cleanupRef.current) return;
    cleanupRef.current = true;

    try {
      // If upgrading, don't close anything - just hand over to video call
      if (isUpgradingRef.current) {
        console.log("🔄 Cleanup skipped - preserving connection for upgrade");
        return;
      }
      
      // Normal cleanup - close everything
      await micTrackRef.current?.stop();
      await micTrackRef.current?.close();
      await videoTrackRef.current?.stop();
      await videoTrackRef.current?.close();
      await clientRef.current?.leave();
    } catch (e) {
      console.warn("Voice cleanup error:", e);
    } finally {
      micTrackRef.current = null;
      clientRef.current = null;
      
      // Only clear active call and shared state if not upgrading
      if (!isUpgradingRef.current) {
        setActiveCall(null);
        setSharedAgoraState({
          client: null,
          micTrack: null,
          cameraTrack: null,
          isUpgrading: false
        });
      }
    }
  };

  /* ================= END CALL ================= */
  const endCall = async () => {
    // Don't emit call:end if upgrading
    if (isUpgradingRef.current) {
      console.log("🔄 Skipping call:end emit - upgrading to video");
      return;
    }
    
    voiceSocket.emit("call:end", {
      roomId,
      endedBy: isUserSide ? "CUSTOMER" : "ASTROLOGER",
    });
    await cleanup();
  };

  const handleCallCanceled = async () => {
    await cleanup();
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    const handleCallEnded = (data) => {
      console.log("📞 call:ended event received:", data);
      // Check BOTH ref (immediate) and state (reactive)
      if (upgradeRejectionRef.current || isUpgradeRejectionProtected) {
        console.log("⚠️ Ignoring call:ended - upgrade rejection protection is active", {
          refProtected: upgradeRejectionRef.current,
          stateProtected: isUpgradeRejectionProtected
        });
        return;
      }
      console.log("📞 Processing call:ended - ending call");
      endCall();
    };

    const handleForceCallEnd = (data) => {
      console.log("📞 force_call_end event received:", data);
      if (upgradeRejectionRef.current || isUpgradeRejectionProtected) {
        console.log("⚠️ Ignoring force_call_end - upgrade rejection protection is active");
        return;
      }
      console.log("📞 Processing force_call_end - ending call");
      endCall();
    };

    const handleDisconnect = (reason) => {
      console.log("📞 disconnect event received:", reason);
      if (upgradeRejectionRef.current || isUpgradeRejectionProtected) {
        console.log("⚠️ Ignoring disconnect - upgrade rejection protection is active");
        return;
      }
      console.log("📞 Processing disconnect - ending call");
      endCall();
    };

    const handleCallRejected = (data) => {
      console.log("📞 call:rejected event received:", data);
      if (upgradeRejectionRef.current || isUpgradeRejectionProtected) {
        console.log("⚠️ Ignoring call:rejected - upgrade rejection protection is active", {
          refProtected: upgradeRejectionRef.current,
          stateProtected: isUpgradeRejectionProtected
        });
        return;
      }
      console.log("📞 Processing call:rejected - ending call");
      endCall();
    };

    voiceSocket.on("call:ended", handleCallEnded);
    voiceSocket.on("force_call_end", handleForceCallEnd);
    voiceSocket.on("disconnect", handleDisconnect);
    voiceSocket.on("call:rejected", handleCallRejected);

    return () => {
      voiceSocket.off("call:ended", handleCallEnded);
      voiceSocket.off("force_call_end", handleForceCallEnd);
      voiceSocket.off("disconnect", handleDisconnect);
      voiceSocket.off("call:rejected", handleCallRejected);
    };
  }, [isUpgradeRejectionProtected]); // Keep state in dependency for reactivity

  /* ================= DRAG ================= */
  const dragOffset = useRef({ x: 0, y: 0 });

  const startDrag = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragOffset.current = { x: x - position.x, y: y - position.y };

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", onDrag);
    document.addEventListener("touchend", stopDrag);
  };

  const onDrag = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    setPosition({ x: x - dragOffset.current.x, y: y - dragOffset.current.y });
  };

  const stopDrag = () => {
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", stopDrag);
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  const openChatWithMinimize = () => {
    setIsMinimized(true);
    navigate(
      PATH.privateRoutes.CHAT_WINDOW.path.replace(
        ":chatId",
        activeCall.userId
      ),
      {
        state: {
          roomId: activeCall.chatRoomId,
          userId: activeCall.userId,
          astrologerId: activeCall.astrologerId,
          kundliId: activeCall.kundliId,
          fullName: activeCall.callerName,
        },
      }
    );
  };

  const toggleCamera = async () => {
    const client = clientRef.current;

    if (!client) return;

    // TURN OFF VIDEO
    if (isVideo) {
      if (videoTrackRef.current) {
        await client.unpublish(videoTrackRef.current);
        videoTrackRef.current.stop();
        videoTrackRef.current.close();
        videoTrackRef.current = null;
      }

      setIsVideo(false);
      return;
    }

    // TURN ON VIDEO
    videoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
    await client.publish(videoTrackRef.current);

    // videoTrackRef.current.play("local-video");
    setIsVideo(true);
  };

  useEffect(() => {
    if (isVideo && videoTrackRef.current) {
      videoTrackRef.current.play(localVideoRef.current);
    }
  }, [isVideo]);
  /* ================= UI ================= */
  return (
    <>
      {/* MINI VIEW */}
      {isMinimized && (
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{ top: position.y, left: position.x }}
          className="
      fixed z-[100000] w-64 p-4
      rounded-2xl bg-[#1e003c]/70 backdrop-blur-xl
      border border-white/20 shadow-2xl
      text-white select-none
    "
        >
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              className="w-10 h-10 rounded-full border border-white/50"
            />
            <div>
              <p className="text-sm font-semibold">{callerName}</p>
              <span className="text-xs opacity-70">
                {joined ? formatTime(timer) : "Calling…"}
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setMicOn(m => !m)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${micOn ? "bg-white/20" : "bg-red-500/80"
                }`}
            >
              {micOn ? <IoMic /> : <IoMicOff />}
            </button>

            <button
              onClick={endCall}
              className="px-4 py-2 rounded-full bg-red-500 text-white text-sm"
            >
              End
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              ⤢
            </button>
          </div>
        </div>
      )}

      {/* Old code */}
      {/* {isMinimized && (
        <div
          className={styles.premiumMini}
          style={{ top: position.y, left: position.x }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className={styles.miniInfo}>
            <p className={styles.miniName}>{callerName}</p>
            <span className={styles.miniStatus}>
              {joined ? formatTime(timer) : "Calling…"}
            </span>
          </div>

          <div className={styles.miniControls}>
            <button onClick={() => setMicOn((m) => !m)}>
              {micOn ? <IoMic /> : <IoMicOff />}
            </button>

            <button className={styles.endBtn} onClick={endCall}>
              End
            </button>

            <button onClick={() => setIsMinimized(false)}>⤢</button>
          </div>
        </div>
      )} */}

      {/* FULL VIEW */}
      {!isMinimized && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-[#0e002e] via-[#220044] to-[#40006a]">

          {/* REMOTE VIDEO (ALWAYS MOUNTED) */}
          <div
            ref={remoteVideoRef}
            className={`absolute inset-0 bg-black ${isRemoteVideo ? "block" : "hidden"}`}
          />

          {/* LOCAL VIDEO (PiP) */}
          {isVideo && (
            <div
              ref={localVideoRef}
              className="absolute bottom-24 right-4 w-32 h-40 rounded-xl overflow-hidden bg-black border border-white/20"
            />
          )}

          {/* MINIMIZE BUTTON */}
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-4 left-4 px-3 py-2 rounded-lg bg-white/20 text-white backdrop-blur-md"
          >
            <IoArrowBack />
          </button>

          {/* VOICE CENTER (ONLY WHEN NO VIDEO) */}
          {!isVideo && (
            <div className="text-center text-white animate-fadeIn">
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="avatar"
                className="w-28 h-28 rounded-full border-4 border-white mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold">{callerName}</h2>
              <p className="opacity-80 mt-1">
                {joined ? `Connected • ${formatTime(timer)}` : "Connecting…"}
              </p>
            </div>
          )}

          {/* CONTROLS */}
          <div className="absolute bottom-8 flex items-center gap-6">

            {/* MIC */}
            <button
              onClick={() => setMicOn(m => !m)}
              className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md"
            >
              {micOn ? <IoMic size={26} /> : <IoMicOff size={26} />}
            </button>

            {/* CAMERA */}
            <button
              onClick={toggleCamera}
              className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md"
            >
              {isVideo ? <IoVideocamOff size={26} /> : <IoVideocam size={26} />}
            </button>

            {/* END */}
            <button
              onClick={endCall}
              className="px-6 py-3 rounded-full bg-red-500 text-white font-medium shadow-lg"
            >
              End
            </button>

            {/* CHAT */}
            <button
              onClick={openChatWithMinimize}
              className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md"
            >
              <IoChatbubbleEllipses size={22} />
            </button>

          </div>
        </div>
      )}

      {/* Old code */}
      {/* {!isMinimized && (
        <div className={styles.fullscreenWrapper}>
          {isRemoteVideo && (
            <div
              id="remote-video"
              className="w-full h-full bg-black rounded-lg"
            />
          )}
          {isVideo && (
            <div
              id="local-video"
              className="absolute bottom-20 right-4 w-32 h-40 bg-black rounded-lg overflow-hidden"
            />
          )}
          <button
            className={styles.minimizeBtn}
            onClick={() => setIsMinimized(true)}
          >
            <IoArrowBack size={20} />
          </button>

          <div className={styles.callingContainer}>
            <h2>{callerName}</h2>

            <p className={styles.status}>
              {joined ? `Connected • ${formatTime(timer)}` : "Connecting…"}
            </p>

            <div className={styles.controls}>
              <button onClick={() => setMicOn((m) => !m)}>
                {micOn ? <IoMic size={28} /> : <IoMicOff size={28} />}
              </button>

              <button onClick={toggleCamera}>
                {isVideo ? <IoVideocamOff /> : <IoVideocam />}
              </button>

              <button className={styles.endBtn} onClick={endCall}>
                End
              </button>

              <button
                onClick={openChatWithMinimize}
              >
                <IoChatbubbleEllipses size={20} />
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default AgoraVoiceCalling;
