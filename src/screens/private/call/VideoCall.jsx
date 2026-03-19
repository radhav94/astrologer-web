import React, { useEffect, useRef, useState, useMemo } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  IoMic,
  IoMicOff,
  IoVideocam,
  IoVideocamOff,
  IoArrowBack,
  IoFilter
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styles from "./VideoCalling.module.scss";
import { voiceSocket } from "../../../services/appServices/voiceSocketServices";
import { useCall } from "../../../context/CallContext";
import { useChat as useChatContext } from "../../../context/chatContext";
import VideoCallChat from "./VideoCallChat";
import { PATH } from "../../../utils/routes/Paths";
import CallIcon from "../../../assets/chat/Call.svg";
import { ReconnectingOverlay } from "../../../components/UI";

const APP_ID = "cf5e31fa03584573aacaf42daebd493c";

const VideoCalling = ({ callData }) => {
  const { activeCall, setActiveCall, setReviewData, setOpenReview, sharedAgoraState, setSharedAgoraState, isUpgradingRef, callStartTime, setCallStartTime, isCallMinimized, setIsCallMinimized, isReconnecting, networkDisconnected } = useCall();
  const { activeChat } = useChatContext();
  const navigate = useNavigate();


  if (!activeCall || activeCall.callType !== "video") {
    return null;
  }

  const { roomId, agoraToken, isUserSide, callerName } = callData;

  const clientRef = useRef(null);
  const micTrackRef = useRef(null);
  const camTrackRef = useRef(null);

  const localVideoFullRef = useRef(null);
  const [isLocalBig, setIsLocalBig] = useState(false);

  const localVideoMiniRef = useRef(null);
  const remoteVideoMiniRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const cleanupRef = useRef(false);
  const endCallRef = useRef(false);
  const userLeftTimerRef = useRef(null);
  const isDowngradingRef = useRef(false); // Track if downgrading to audio

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat panel state
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false); // Track if remote user has video on

  /* ================= LOCAL VIDEO ================= */
  const playLocalVideo = (container) => {
    if (!camTrackRef.current || !container) return;

    try {
      camTrackRef.current.stop(); // 🔥 IMPORTANT - stops the track before replaying
    } catch (e) { }

    container.innerHTML = "";
    camTrackRef.current.play(container);
  };


  /* ================= REMOTE VIDEO SAFE PLAY ================= */
  // const safePlayRemoteVideo = (track) => {
  //   if (!remoteVideoRef.current || !track) return;

  //   remoteVideoRef.current.innerHTML = "";
  //   const div = document.createElement("div");
  //   div.style.width = "100%";
  //   div.style.height = "100%";
  //   remoteVideoRef.current.appendChild(div);

  //   setTimeout(() => {
  //     try {
  //       track.play(div);
  //     } catch (e) {
  //       console.warn("Retry remote video play");
  //       setTimeout(() => track.play(div), 300);
  //     }
  //   }, 150);
  // };

  const safePlayRemoteVideo = (track) => {
    if (!track) return;

    const container = isLocalBig
      ? localVideoFullRef.current
      : remoteVideoRef.current;

    if (!container) return;

    try {
      track.stop(); // 🔥 VERY IMPORTANT
    } catch (e) { }

    container.innerHTML = "";

    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    container.appendChild(div);

    setTimeout(() => {
      try {
        track.play(div);
      } catch (err) {
        console.warn("Remote play retry");
        setTimeout(() => track.play(div), 300);
      }
    }, 100);
  };


  /* ================= RESUME REMOTE AUDIO ================= */
  const resumeRemoteTracks = () => {
    if (!clientRef.current) return;

    clientRef.current.remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.play();
      }
      if (user.videoTrack && remoteVideoRef.current) {
        safePlayRemoteVideo(user.videoTrack);
      }
    });
  };

  const resumeRemoteAudio = () => {
    if (!clientRef.current) return;

    clientRef.current.remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.play();
      }
    });
  };


  /* ================= START CALL ================= */
  useEffect(() => {
    cleanupRef.current = false;
    endCallRef.current = false;
    let didCancelStart = false;

    const start = async () => {
      try {
        // If we're reconnecting after network drop, don't try to rejoin Agora
        // The existing Agora client will handle reconnection automatically
        if (isReconnecting || networkDisconnected) {
          console.log("[VideoCall] 🔄 Skipping Agora join - reconnection in progress");
          return;
        }

        // Check if we're upgrading from audio call
        // We check for existing client/micTrack even if isUpgrading flag isn't set yet
        // because state updates are asynchronous
        const shouldUpgrade = (sharedAgoraState.isUpgrading ||
          (sharedAgoraState.client && sharedAgoraState.micTrack)) &&
          sharedAgoraState.client &&
          sharedAgoraState.micTrack;

        console.log("🔍 Should upgrade?", shouldUpgrade);

        if (shouldUpgrade) {
          console.log("🔄 Upgrading from audio to video - reusing connection");

          // Reuse existing client and mic track
          clientRef.current = sharedAgoraState.client;
          micTrackRef.current = sharedAgoraState.micTrack;

          console.log("📹 Creating camera track...");
          // Only create and publish camera track
          camTrackRef.current = await AgoraRTC.createCameraVideoTrack();

          console.log("📤 Publishing camera track...");
          await clientRef.current.publish([camTrackRef.current]);

          console.log("✅ Camera track published successfully");

          // Add event listeners for video (the audio call client doesn't have these)
          clientRef.current.on("user-published", async (user, mediaType) => {
            console.log(`📹 [UPGRADE] User published ${mediaType}:`, user.uid);

            if (mediaType === "video") {
              try {
                await clientRef.current.subscribe(user, mediaType);
                if (user.videoTrack) {
                  console.log("📹 [UPGRADE] Playing newly published video track");
                  setHasRemoteVideo(true);
                  safePlayRemoteVideo(user.videoTrack);
                }
              } catch (err) {
                console.error("[UPGRADE] Failed to subscribe to video:", err);
              }
            }
          });

          clientRef.current.on("user-unpublished", (user, mediaType) => {
            console.log(`📹 [UPGRADE] User unpublished ${mediaType}:`, user.uid);
            if (mediaType === "video") {
              setHasRemoteVideo(false);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.innerHTML = "";
              }
            }
          });

          // Update shared state
          setSharedAgoraState(prev => ({
            ...prev,
            cameraTrack: camTrackRef.current,
            isUpgrading: false
          }));
          isUpgradingRef.current = false; // Reset synchronous ref

          setJoined(true);

          timerRef.current = setInterval(() => {
            setCallSeconds((p) => p + 1);
          }, 1000);

          // 🔥 CRITICAL: Check for existing remote users after upgrade
          setTimeout(async () => {
            console.log("🔍 [UPGRADE] Checking for existing remote users...");
            const remoteUsers = clientRef.current.remoteUsers;
            console.log(`📊 [UPGRADE] Found ${remoteUsers.length} remote users`);

            for (const user of remoteUsers) {
              console.log(`👤 [UPGRADE] Remote user ${user.uid}:`, {
                hasVideo: user.hasVideo,
                hasAudio: user.hasAudio,
                videoTrack: !!user.videoTrack,
                audioTrack: !!user.audioTrack
              });

              // Subscribe to video if available but not subscribed
              if (user.hasVideo && !user.videoTrack) {
                try {
                  console.log(`📹 [UPGRADE] Subscribing to existing video from user ${user.uid}`);
                  await clientRef.current.subscribe(user, "video");
                  if (user.videoTrack) {
                    console.log("📹 [UPGRADE] Playing existing video track");
                    setHasRemoteVideo(true);
                    safePlayRemoteVideo(user.videoTrack);
                  }
                } catch (err) {
                  console.error("[UPGRADE] Failed to subscribe to existing video:", err);
                }
              } else if (user.videoTrack) {
                // Already subscribed, just play it
                console.log(`📹 [UPGRADE] Playing already-subscribed video from user ${user.uid}`);
                setHasRemoteVideo(true);
                safePlayRemoteVideo(user.videoTrack);
              }

              // Ensure audio is playing
              if (user.audioTrack) {
                console.log(`🔊 [UPGRADE] Playing audio from user ${user.uid}`);
                user.audioTrack.play();
              }
            }
          }, 1000);

          return;
        }

        // Fresh video call - normal flow
        if (clientRef.current) {
          await clientRef.current.leave();
          clientRef.current.removeAllListeners();
          clientRef.current = null;
        }

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          console.log(`📹 User published ${mediaType}:`, user.uid);

          // Cancel any pending end-call grace timer — remote user is back
          if (userLeftTimerRef.current) {
            clearTimeout(userLeftTimerRef.current);
            userLeftTimerRef.current = null;
            console.log("[VideoCall] ✅ user-published: cancelled pending endCall grace timer");
          }

          await client.subscribe(user, mediaType);

          if (mediaType === "video" && user.videoTrack) {
            console.log("📹 Playing remote video track");
            setHasRemoteVideo(true);
            safePlayRemoteVideo(user.videoTrack);
          }

          if (mediaType === "audio" && user.audioTrack) {
            console.log("🔊 Playing remote audio track");
            user.audioTrack.play();
            // Set initial volume based on speaker state
            if (user.audioTrack) {
              user.audioTrack.setVolume(speakerOn ? 100 : 0);
            }
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          console.log(`📹 User unpublished ${mediaType}:`, user.uid);
          if (mediaType === "video") {
            setHasRemoteVideo(false);
            if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
          }
        });

        client.on("user-left", (user) => {
          console.log("[VideoCall] 👋 user-left — uid:", user.uid, "starting 30s grace timer");
          if (userLeftTimerRef.current) clearTimeout(userLeftTimerRef.current);
          userLeftTimerRef.current = setTimeout(() => {
            console.log("[VideoCall] ⏰ user-left grace timer expired — ending call");
            handleRemoteCallEnd();
          }, 60000); // 60s grace period — matches backend disconnect grace
        });

        client.on("user-joined", (user) => {
          console.log("[VideoCall] 🤝 user-joined — uid:", user.uid);
          if (userLeftTimerRef.current) {
            clearTimeout(userLeftTimerRef.current);
            userLeftTimerRef.current = null;
            console.log("[VideoCall] ✅ user-joined: cancelled pending endCall grace timer");
          }
        });

        // On mobile Safari, requesting mic and camera separately can leave the call
        // joined-but-unpublished long enough for the backend to resume chat.
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        if (didCancelStart || cleanupRef.current || endCallRef.current) {
          micTrack.stop();
          micTrack.close();
          camTrack.stop();
          camTrack.close();
          return;
        }

        micTrackRef.current = micTrack;
        camTrackRef.current = camTrack;

        await client.join(APP_ID, roomId, agoraToken, null);

        if (didCancelStart || cleanupRef.current || endCallRef.current) {
          await client.leave();
          return;
        }

        await client.publish([micTrackRef.current, camTrackRef.current]);

        // Store in shared state
        setSharedAgoraState({
          client: client,
          micTrack: micTrackRef.current,
          cameraTrack: camTrackRef.current,
          isUpgrading: false
        });

        setJoined(true);

        if (!callStartTime) setCallStartTime(Date.now());

        // 🔥 CRITICAL: Check for existing remote users after joining
        // This handles the case when switching from voice to video call
        setTimeout(async () => {
          console.log("🔍 Checking for existing remote users...");
          const remoteUsers = client.remoteUsers;
          console.log(`📊 Found ${remoteUsers.length} remote users`);

          for (const user of remoteUsers) {
            console.log(`👤 Remote user ${user.uid}:`, {
              hasVideo: user.hasVideo,
              hasAudio: user.hasAudio,
              videoTrack: !!user.videoTrack,
              audioTrack: !!user.audioTrack
            });

            // Subscribe to video if available but not subscribed
            if (user.hasVideo && !user.videoTrack) {
              try {
                console.log(`📹 Subscribing to existing video from user ${user.uid}`);
                await client.subscribe(user, "video");
                if (user.videoTrack) {
                  console.log("📹 Playing existing video track");
                  safePlayRemoteVideo(user.videoTrack);
                  setHasRemoteVideo(true);
                }
              } catch (err) {
                console.error("Failed to subscribe to existing video:", err);
              }
            } else if (user.videoTrack) {
              // Already subscribed, just play it
              console.log(`📹 Playing already-subscribed video from user ${user.uid}`);
              safePlayRemoteVideo(user.videoTrack);
              setHasRemoteVideo(true);
            }

            // Subscribe to audio if available but not subscribed
            if (user.hasAudio && !user.audioTrack) {
              try {
                console.log(`🔊 Subscribing to existing audio from user ${user.uid}`);
                await client.subscribe(user, "audio");
                if (user.audioTrack) {
                  console.log("🔊 Playing existing audio track");
                  user.audioTrack.play();
                  user.audioTrack.setVolume(speakerOn ? 100 : 0);
                }
              } catch (err) {
                console.error("Failed to subscribe to existing audio:", err);
              }
            } else if (user.audioTrack) {
              // Already subscribed, just play it
              console.log(`🔊 Playing already-subscribed audio from user ${user.uid}`);
              user.audioTrack.play();
              user.audioTrack.setVolume(speakerOn ? 100 : 0);
            }
          }
        }, 1000);
      } catch (err) {
        if (didCancelStart || cleanupRef.current || endCallRef.current) {
          return;
        }
        console.error("CALL START ERROR", err);
        
        // Don't cleanup on network errors during reconnection - let the reconnection logic handle it
        const isNetworkError = err?.code === "CAN_NOT_GET_GATEWAY_SERVER" || 
                               err?.message?.includes("CAN_NOT_GET_GATEWAY_SERVER") ||
                               err?.message?.includes("network");
        
        if (isNetworkError && (isReconnecting || networkDisconnected)) {
          console.log("[VideoCall] 🔄 Network error during reconnection - waiting for network to stabilize");
          return;
        }
        
        safeEndCall();
      }
    };

    start();
    return () => {
      console.log("🎬 [VIDEO] Cleanup function called");
      didCancelStart = true;
      cleanup();
    };
    // eslint-disable-next-line
  }, [roomId]);

  /* ================= WATCH FOR DOWNGRADE ================= */
  useEffect(() => {
    isDowngradingRef.current = sharedAgoraState.isDowngrading;
    // If downgrade was just triggered while we're mounted, set it on the ref immediately
    if (sharedAgoraState.isDowngrading) {
      console.log("📹 [VIDEO] isDowngradingRef set to true via effect");
    }
  }, [sharedAgoraState.isDowngrading]);

  /* ================= LOCAL VIDEO ================= */


  useEffect(() => {
    if (!joined) return;

    if (isCallMinimized) {
      // Play remote video in mini view
      if (clientRef.current && remoteVideoMiniRef.current) {
        clientRef.current.remoteUsers.forEach((user) => {
          if (user.videoTrack) {
            try { user.videoTrack.stop(); } catch (e) { }
            remoteVideoMiniRef.current.innerHTML = "";
            const div = document.createElement("div");
            div.style.width = "100%";
            div.style.height = "100%";
            remoteVideoMiniRef.current.appendChild(div);
            setTimeout(() => {
              try { user.videoTrack.play(div); } catch (e) { }
            }, 100);
          }
        });
      }
    } else if (isLocalBig) {
      playLocalVideo(remoteVideoRef.current); // local goes big
      // Replay remote in the other container
      resumeRemoteTracks();
    } else {
      playLocalVideo(localVideoFullRef.current); // local stays small
      // Replay remote in main container
      resumeRemoteTracks();
    }
  }, [joined, isCallMinimized, isLocalBig]);

  /* ================= CALL TIMER FROM SHARED START TIME ================= */
  useEffect(() => {
    if (!callStartTime) return;
    timerRef.current = setInterval(() => {
      setCallSeconds(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStartTime]);

  useEffect(() => {
    if (!clientRef.current) return;
    resumeRemoteTracks();
  }, [isLocalBig]);


  useEffect(() => {
    micTrackRef.current?.setEnabled(micOn);
    resumeRemoteAudio();
  }, [micOn]);

  useEffect(() => {
    camTrackRef.current?.setEnabled(cameraOn);

    // Replay local video when camera is turned back on
    if (cameraOn && camTrackRef.current && localVideoFullRef.current) {
      setTimeout(() => {
        playLocalVideo(localVideoFullRef.current);
      }, 100);
    }
  }, [cameraOn]);

  /* ================= SPEAKER TOGGLE ================= */
  useEffect(() => {
    if (!clientRef.current) return;

    // Control volume of all remote audio tracks
    clientRef.current.remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(speakerOn ? 100 : 0);
      }
    });
  }, [speakerOn]);

  /* ================= REMOTE VIDEO SAFETY REPLAY ================= */
  useEffect(() => {
    if (!joined || !clientRef.current) return;

    clientRef.current.remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        safePlayRemoteVideo(user.videoTrack);
      }
    });
  }, [joined]);

  /* ================= CLEANUP ================= */
  const cleanup = async () => {
    console.log("🧹 [VIDEO CLEANUP] Starting cleanup...");

    if (cleanupRef.current) return;
    cleanupRef.current = true;

    console.log("🧹 [VIDEO CLEANUP] Proceeding with cleanup");

    // Use the ref (synchronous, always up-to-date) as the primary check
    const isDowngrading = isDowngradingRef.current;

    console.log("🧹 [VIDEO CLEANUP] isDowngrading:", isDowngrading);

    // If downgrading, keep mic track and client alive for VoiceCall to reuse
    if (isDowngrading) {
      console.log("🔽 Downgrading to audio - keeping mic and client, closing camera only");

      try {
        // Unpublish camera from the Agora client FIRST so remote side stops receiving video
        if (clientRef.current && camTrackRef.current) {
          try {
            await clientRef.current.unpublish([camTrackRef.current]);
            console.log("✅ [VIDEO CLEANUP] Camera track unpublished from client");
          } catch (e) {
            console.warn("⚠️ [VIDEO CLEANUP] Failed to unpublish camera:", e);
          }
        }

        // Then stop and close camera track
        try {
          camTrackRef.current?.stop();
          camTrackRef.current?.close();
        } catch (e) {
          console.warn("⚠️ [VIDEO CLEANUP] Failed to stop/close camera:", e);
        }
        camTrackRef.current = null;

        // Clear the camera from shared state (keep client and mic intact)
        setSharedAgoraState(prev => ({
          ...prev,
          cameraTrack: null
        }));

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setJoined(false);
        setCallSeconds(0);
        // Don't clear callStartTime, activeCall, or shared client/mic
        // Don't clear clientRef.current or micTrackRef.current - VoiceCall needs them

        console.log("✅ [VIDEO CLEANUP] Downgrade cleanup complete - client and mic preserved");
      } catch (e) {
        console.warn("Error during downgrade cleanup:", e);
      }

      return; // Exit early - don't run the normal cleanup below
    }

    // Normal cleanup - close everything
    console.log("🧹 [VIDEO CLEANUP] Normal cleanup - closing everything");
    try {
      // Use try-catch for each operation to prevent one failure from blocking others
      try {
        micTrackRef.current?.stop();
        micTrackRef.current?.close();
      } catch (e) {
        console.warn("[VideoCall] Mic track cleanup error:", e.message);
      }

      try {
        camTrackRef.current?.stop();
        camTrackRef.current?.close();
      } catch (e) {
        console.warn("[VideoCall] Camera track cleanup error:", e.message);
      }

      // Only attempt to leave if client exists and is connected
      if (clientRef.current) {
        try {
          // Check connection state before leaving to avoid WS_ABORT
          const connectionState = clientRef.current.connectionState;
          if (connectionState === "CONNECTED" || connectionState === "CONNECTING") {
            await clientRef.current.leave();
          }
          clientRef.current.removeAllListeners();
        } catch (e) {
          // Ignore WS_ABORT and other leave errors - channel may already be closed
          console.warn("[VideoCall] Client leave error (safe to ignore):", e.message);
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      micTrackRef.current = null;
      camTrackRef.current = null;
      clientRef.current = null;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = "";
      }

      sessionStorage.removeItem("shubhtalk_active_call");
      sessionStorage.removeItem("shubhtalk_call_start_time");

      setJoined(false);
      setCallSeconds(0);
      setCallStartTime(null);
      setActiveCall(null);

      // Clear shared state
      setSharedAgoraState({
        client: null,
        micTrack: null,
        cameraTrack: null,
        isUpgrading: false,
        isDowngrading: false
      });
      isUpgradingRef.current = false;
    }
  };

  /* ================= SAFE END CALL (User initiated) ================= */
  const safeEndCall = async () => {
    // Don't emit call:end if downgrading
    if (isDowngradingRef.current) {
      console.log("🔽 Skipping call:end emit - downgrading to audio");
      return;
    }

    console.log("📞 User initiated video call end - emitting call:end");
    if (endCallRef.current) return;
    endCallRef.current = true;
    setReviewData({
      userID: activeCall.userID,
      fullName: activeCall.callerName,
    });

    voiceSocket.emit("call:end", {
      roomId,
      endedBy: isUserSide ? "CUSTOMER" : "ASTROLOGER",
    });

    // Don't show review popup if chat is still active
    if (!activeChat) {
      setOpenReview(true);
    }
    await cleanup();
  };

  /* ================= HANDLE REMOTE/SERVER CALL END ================= */
  const handleRemoteCallEnd = async () => {
    // Don't end call if downgrading
    if (isDowngradingRef.current) {
      console.log("🔽 Ignoring remote call end - downgrading to audio");
      return;
    }

    console.log("📞 Remote/Server ended video call - cleaning up without emitting call:end");
    if (endCallRef.current) return;
    endCallRef.current = true;
    setReviewData({
      userID: activeCall.userID,
      fullName: activeCall.callerName,
    });

    // Don't emit call:end - already ended by remote/server
    // Don't show review popup if chat is still active
    if (!activeChat) {
      setOpenReview(true);
    }
    await cleanup();
  };

  // Use ref to always have the latest handler available for socket listeners
  const handleRemoteCallEndRef = useRef(handleRemoteCallEnd);
  handleRemoteCallEndRef.current = handleRemoteCallEnd;

  /* ================= HANDLE CALL CANCELED ================= */
  const handleCallCanceled = async () => {
    console.log("📞 Call canceled");
    if (endCallRef.current) return;
    endCallRef.current = true;

    await cleanup();
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    console.log("[VideoCall] Setting up socket listeners for room:", roomId);
    
    const onCallEnded = () => {
      console.log("📞 call:ended received in VideoCall");
      // Don't end call if we're downgrading to audio
      if (isDowngradingRef.current) {
        console.log("🔽 Ignoring call:ended - downgrading to audio");
        return;
      }
      handleRemoteCallEndRef.current();
    };

    const onForceCallEnd = () => {
      console.log("📞 force_call_end received in VideoCall");
      // Don't end call if we're downgrading to audio
      if (isDowngradingRef.current) {
        console.log("🔽 Ignoring force_call_end - downgrading to audio");
        return;
      }
      handleRemoteCallEndRef.current();
    };

    const onCallCanceled = () => {
      console.log("📞 call:canceled received in VideoCall");
      // Don't end call if we're downgrading to audio
      if (isDowngradingRef.current) {
        console.log("🔽 Ignoring call:canceled - downgrading to audio");
        return;
      }
      if (endCallRef.current || cleanupRef.current) return;
      endCallRef.current = true;
      cleanup();
    };

    voiceSocket.on("call:ended", onCallEnded);
    voiceSocket.on("force_call_end", onForceCallEnd);
    voiceSocket.on("call:canceled", onCallCanceled);

    return () => {
      console.log("[VideoCall] Cleaning up socket listeners for room:", roomId);
      voiceSocket.off("call:ended", onCallEnded);
      voiceSocket.off("force_call_end", onForceCallEnd);
      voiceSocket.off("call:canceled", onCallCanceled);
    };
  }, [roomId]);

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

  /* ================= CHAT ================= */
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const openChatWithMinimize = () => {
    setIsCallMinimized(true);
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
    )
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  // Memoize chat data to prevent unnecessary re-renders
  const chatData = useMemo(() => ({
    userId: activeCall.userId,
    astrologerId: activeCall.astrologerId,
    chatRoomId: activeCall.chatRoomId,
    kundliId: activeCall.kundliId,
    isUserSide: activeCall.isUserSide,
  }), [activeCall.userId, activeCall.astrologerId, activeCall.chatRoomId, activeCall.kundliId, activeCall.isUserSide]);
  return (
    <>
      {/* RECONNECTING OVERLAY */}
      <ReconnectingOverlay
        isVisible={networkDisconnected || isReconnecting}
        message={isReconnecting ? "Reconnecting..." : "Connection lost..."}
      />

      {/* MINI VIEW */}
      <div
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          display: isCallMinimized ? "block" : "none",
          zIndex: 100000,
        }}
        className="w-48 rounded-2xl bg-[#1e003c]/70 backdrop-blur-xl border border-white/20 shadow-2xl text-white select-none overflow-hidden"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onClick={resumeRemoteAudio}
      >
        {/* Remote Video Preview */}
        <div className="w-full h-40 bg-black relative">
          <div
            ref={remoteVideoMiniRef}
            className="w-full h-full"
            style={{ transform: 'scaleX(-1)' }}
          />
          {/* Overlay: name + timer */}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-[10px] font-semibold truncate capitalize">{callerName || "Video Call"}</p>
            <span className="text-[10px] opacity-70">
              {joined ? formatTime(callSeconds) : "Connecting…"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-2 flex justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); setMicOn((p) => !p); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${micOn ? "bg-white/20" : "bg-red-500/80"}`}
          >
            {micOn ? <IoMic size={14} /> : <IoMicOff size={14} />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setIsCallMinimized(false); }}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm"
          >
            ⤢
          </button>
        </div>
      </div>

      {/* FULL VIEW */}
      <div
        className="fixed inset-0 z-[99999] flex flex-col"
        style={{
          visibility: isCallMinimized ? "hidden" : "visible",
          backgroundColor: hasRemoteVideo ? 'transparent' : 'white'
        }}
      >
        {/* HEADER */}
        <div
          className="flex items-center justify-between px-4 md:px-6 py-3 border-b z-50 transition-all duration-300"
          style={{
            position: hasRemoteVideo ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: hasRemoteVideo ? 'rgba(0, 0, 0, 0.3)' : 'white',
            backdropFilter: hasRemoteVideo ? 'blur(10px)' : 'none',
            borderColor: hasRemoteVideo ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'
          }}
        >
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => setIsCallMinimized(true)}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ borderColor: '#f75801' }}
            >
              <IoArrowBack size={20} style={{ color: '#f75801' }} />
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}>
              {callerName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* User Info */}
            <div className="flex flex-col">
              <h2
                className="text-sm font-semibold transition-colors duration-300 capitalize truncate max-w-[150px]"
                style={{ color: hasRemoteVideo ? 'white' : '#111827' }}
              >
                {callerName}
              </h2>
            </div>
          </div>

          {/* Desktop View - Chat icon, Audio/Video toggle, Timer, View Profile button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={openChatWithMinimize}
              className="w-10 h-10 rounded-lg border flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{
                borderColor: '#f75801'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 17 17" fill="none">
                <path d="M15 0H1.66667C0.75 0 0.00833333 0.75 0.00833333 1.66667L0 16.6667L3.33333 13.3333H15C15.9167 13.3333 16.6667 12.5833 16.6667 11.6667V1.66667C16.6667 0.75 15.9167 0 15 0ZM4.16667 5.83333H12.5C12.9583 5.83333 13.3333 6.20833 13.3333 6.66667C13.3333 7.125 12.9583 7.5 12.5 7.5H4.16667C3.70833 7.5 3.33333 7.125 3.33333 6.66667C3.33333 6.20833 3.70833 5.83333 4.16667 5.83333ZM9.16667 10H4.16667C3.70833 10 3.33333 9.625 3.33333 9.16667C3.33333 8.70833 3.70833 8.33333 4.16667 8.33333H9.16667C9.625 8.33333 10 8.70833 10 9.16667C10 9.625 9.625 10 9.16667 10ZM12.5 5H4.16667C3.70833 5 3.33333 4.625 3.33333 4.16667C3.33333 3.70833 3.70833 3.33333 4.16667 3.33333H12.5C12.9583 3.33333 13.3333 3.70833 13.3333 4.16667C13.3333 4.625 12.9583 5 12.5 5Z" fill="url(#paint0_linear_desktop_chat_video)" />
                <defs>
                  <linearGradient id="paint0_linear_desktop_chat_video" x1="0" y1="8.33333" x2="16.6667" y2="8.33333" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F75801" />
                    <stop offset="1" stopColor="#D43400" />
                  </linearGradient>
                </defs>
              </svg>
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            <button
              onClick={() => setCameraOn((p) => !p)}
              className="w-10 h-10 rounded-lg border flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{
                borderColor: '#f75801'
              }}
            >
              {cameraOn ? (
                <img src={CallIcon} alt="Audio" width="20" height="20" style={{ filter: 'invert(45%) sepia(94%) saturate(2477%) hue-rotate(356deg) brightness(101%) contrast(98%)' }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="13" viewBox="0 0 17 11" fill="none">
                  <path d="M12.8333 4.125V0.916667C12.8333 0.4125 12.4208 0 11.9167 0H0.916667C0.4125 0 0 0.4125 0 0.916667V10.0833C0 10.5875 0.4125 11 0.916667 11H11.9167C12.4208 11 12.8333 10.5875 12.8333 10.0833V6.875L14.9325 8.97417C15.51 9.55167 16.5 9.13917 16.5 8.32333V2.6675C16.5 1.85167 15.51 1.43917 14.9325 2.01667L12.8333 4.125Z" fill="url(#paint0_linear_desktop)" />
                  <defs>
                    <linearGradient id="paint0_linear_desktop" x1="0" y1="5.5" x2="16.5" y2="5.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F75801" />
                      <stop offset="1" stopColor="#D43400" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </button>

            <span
              className="text-sm font-medium ml-2 transition-colors duration-300"
              style={{ color: hasRemoteVideo ? 'white' : '#374151' }}
            >
              Call Ends in <span className="text-red-500 font-semibold">{formatTime(callSeconds)}</span>
            </span>

            <button
              onClick={toggleChat}
              className="px-5 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}
            >
              View Kundli
            </button>
          </div>

          {/* Mobile View - Timer and View Profile button */}
          <div className="md:hidden flex items-center gap-3">
            <span className="text-sm font-semibold text-red-500">{formatTime(callSeconds)}</span>

            <button
              onClick={toggleChat}
              className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}
            >
              View Kundli
            </button>
          </div>
        </div>

        {/* Mobile Chat Button - Part of sticky header */}
        <div
          className="md:hidden flex gap-3 px-4 py-3 border-b z-50 transition-all duration-300"
          style={{
            position: hasRemoteVideo ? 'absolute' : 'relative',
            top: hasRemoteVideo ? '60px' : 'auto',
            left: 0,
            right: 0,
            backgroundColor: hasRemoteVideo ? 'rgba(0, 0, 0, 0.3)' : '#FFF8F0',
            backdropFilter: hasRemoteVideo ? 'blur(10px)' : 'none',
            borderColor: hasRemoteVideo ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'
          }}
        >
          <button
            onClick={openChatWithMinimize}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 hover:opacity-90 transition-all duration-300"
            style={{
              borderColor: '#f75801',
              backgroundColor: hasRemoteVideo ? 'rgba(255, 255, 255, 0.1)' : 'white',
              backdropFilter: hasRemoteVideo ? 'blur(10px)' : 'none'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 17 17" fill="none">
              <path d="M15 0H1.66667C0.75 0 0.00833333 0.75 0.00833333 1.66667L0 16.6667L3.33333 13.3333H15C15.9167 13.3333 16.6667 12.5833 16.6667 11.6667V1.66667C16.6667 0.75 15.9167 0 15 0ZM4.16667 5.83333H12.5C12.9583 5.83333 13.3333 6.20833 13.3333 6.66667C13.3333 7.125 12.9583 7.5 12.5 7.5H4.16667C3.70833 7.5 3.33333 7.125 3.33333 6.66667C3.33333 6.20833 3.70833 5.83333 4.16667 5.83333ZM9.16667 10H4.16667C3.70833 10 3.33333 9.625 3.33333 9.16667C3.33333 8.70833 3.70833 8.33333 4.16667 8.33333H9.16667C9.625 8.33333 10 8.70833 10 9.16667C10 9.625 9.625 10 9.16667 10ZM12.5 5H4.16667C3.70833 5 3.33333 4.625 3.33333 4.16667C3.33333 3.70833 3.70833 3.33333 4.16667 3.33333H12.5C12.9583 3.33333 13.3333 3.70833 13.3333 4.16667C13.3333 4.625 12.9583 5 12.5 5Z" fill="url(#paint0_linear_mobile_chat_video)" />
              <defs>
                <linearGradient id="paint0_linear_mobile_chat_video" x1="0" y1="8.33333" x2="16.6667" y2="8.33333" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F75801" />
                  <stop offset="1" stopColor="#D43400" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-base font-medium" style={{ color: '#f75801' }}>Chat</span>
          </button>

          <button
            onClick={() => setCameraOn((p) => !p)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 hover:opacity-90 transition-all duration-300"
            style={{
              borderColor: '#f75801',
              backgroundColor: hasRemoteVideo ? 'rgba(255, 255, 255, 0.1)' : 'white',
              backdropFilter: hasRemoteVideo ? 'blur(10px)' : 'none'
            }}
          >
            {cameraOn ? (
              <img src={CallIcon} alt="Audio" width="22" height="22" style={{ filter: 'invert(45%) sepia(94%) saturate(2477%) hue-rotate(356deg) brightness(101%) contrast(98%)' }} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="15" viewBox="0 0 17 11" fill="none">
                <path d="M12.8333 4.125V0.916667C12.8333 0.4125 12.4208 0 11.9167 0H0.916667C0.4125 0 0 0.4125 0 0.916667V10.0833C0 10.5875 0.4125 11 0.916667 11H11.9167C12.4208 11 12.8333 10.5875 12.8333 10.0833V6.875L14.9325 8.97417C15.51 9.55167 16.5 9.13917 16.5 8.32333V2.6675C16.5 1.85167 15.51 1.43917 14.9325 2.01667L12.8333 4.125Z" fill="url(#paint0_linear_mobile)" />
                <defs>
                  <linearGradient id="paint0_linear_mobile" x1="0" y1="5.5" x2="16.5" y2="5.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F75801" />
                    <stop offset="1" stopColor="#D43400" />
                  </linearGradient>
                </defs>
              </svg>
            )}
            <span className="text-base font-medium" style={{ color: '#f75801' }}>{cameraOn ? "Audio" : "Video"}</span>
          </button>
        </div>

        {!joined ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-xl">Connecting…</div>
          </div>
        ) : (
          <div
            className="relative"
            style={{
              flex: 1,
              marginTop: cameraOn ? 0 : 'auto'
            }}
          >
            {/* REMOTE VIDEO */}
            <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full" style={{ transform: 'scaleX(-1)' }} />

            {/* SHOW AVATAR WHEN REMOTE USER CAMERA IS OFF */}
            {!hasRemoteVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                  {/* AVATAR WITH ACTIVE RIPPLE EFFECT */}
                  <div className="relative mb-3">
                    {/* Active ripple rings */}
                    <div className={styles.rippleRing}></div>
                    <div className={styles.rippleRing}></div>
                    <div className={styles.rippleRing}></div>
                    <div className={styles.rippleRing}></div>

                    {/* Avatar with green border */}
                    <div className="relative w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl bg-white z-10" style={{ border: '8px solid #b7d9a5' }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* CALLER NAME */}
                  <p className="text-xl font-semibold text-gray-900 capitalize whitespace-nowrap">
                    {callerName}
                  </p>

                  {/* CALL TIMER TEXT */}
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    {formatTime(callSeconds)}
                  </h3>
                </div>
              </div>
            )}

            {/* LOCAL VIDEO (PiP) - Only show when camera is ON */}
            {cameraOn && (
              <div
                className="absolute rounded-xl overflow-hidden bg-black border-2 border-white shadow-lg cursor-pointer"
                style={{
                  top: '160px',
                  right: '16px',
                  width: '128px',
                  height: '160px',
                  zIndex: 100
                }}
                onClick={() => setIsLocalBig((p) => !p)}
              >
                <div
                  ref={localVideoFullRef}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            )}

            {/* BOTTOM CONTROLS SECTION */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20"
              style={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* SUGGEST REMEDY BUTTON - Blurred Background */}
              <div
                style={{
                  backdropFilter: hasRemoteVideo ? 'blur(20px)' : 'none',
                  background: hasRemoteVideo ? 'rgba(100, 100, 100, 0.4)' : 'transparent',
                  padding: '20px 0',
                  display: 'flex',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
              >
                <button
                  className="px-8 py-3 text-white rounded-full text-base font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #f75801, #d43400)'
                  }}
                >
                  Suggest Remedy
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </button>
              </div>

              {/* CONTROL BUTTONS - Solid Black Background */}
              <div
                style={{
                  background: hasRemoteVideo ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
                  padding: '24px 20px 32px 20px',
                  transition: 'all 0.3s'
                }}
              >
                <div className="flex items-center justify-center gap-8 md:gap-6">

                  {/* MUTE BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setMicOn((p) => !p)}
                      className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      {micOn ? (
                        <IoMic size={28} style={{ color: '#f75801' }} />
                      ) : (
                        <IoMicOff size={28} style={{ color: '#f75801' }} />
                      )}
                    </button>
                    <span className="text-sm font-medium text-white">
                      {micOn ? "Mute" : "Unmute"}
                    </span>
                  </div>

                  {/* REPORT CALLER BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={safeEndCall}
                      className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 20h20L12 2z" fill="white" />
                        <rect x="11" y="8" width="2" height="6" fill="#ef4444" rx="1" />
                        <circle cx="12" cy="17" r="1" fill="#ef4444" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-white">Report Caller</span>
                  </div>

                  {/* SPEAKER BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setSpeakerOn((p) => !p)}
                      className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      {speakerOn ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f75801" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 010 7.07" />
                          <path d="M19.07 4.93a10 10 0 010 14.14" />
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f75801" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      )}
                    </button>
                    <span className="text-sm font-medium text-white">
                      Speaker {speakerOn ? "On" : "Off"}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
        {/* Chat Panel */}
        {isChatOpen && (
          <VideoCallChat
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            videoCallData={chatData}
          />
        )}
      </div>
    </>
  );
};

export default VideoCalling;
