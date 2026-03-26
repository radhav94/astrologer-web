import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  IoMic,
  IoMicOff,
  IoArrowBack,
  IoCallSharp
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styles from "./VoiceCall.module.scss";
// import { voiceSocket } from "../../services/voiceSocketServices";
// import { useCall } from "../../context/CallContext";
// import { PATH } from "../../utils/routes/Paths";
import { useCall } from "../../../context/CallContext";
import { voiceSocket } from "../../../services/appServices/voiceSocketServices";
import { PATH } from "../../../utils/routes/Paths";
import { useChat as useChatContext } from "../../../context/chatContext";
import CallIcon from "../../../assets/chat/Call.svg";
import VideoCallChat from "./VideoCallChat";
import { ReconnectingOverlay } from "../../../components/UI";
import SuggestRemedyPanel from "./SuggestRemedyPanel";
import ReportCaller from "../chat/review/ReportCaller";
import { useSubmitReportMutation } from "../../../redux/review/reviewApi";
import { Toast } from "../../../components";

const APP_ID = "cf5e31fa03584573aacaf42daebd493c";

const AgoraVoiceCalling = ({ callData }) => {
  const { activeCall, setActiveCall, sharedAgoraState, setSharedAgoraState, isUpgradeRejectionProtected, upgradeRejectionRef, isUpgradingRef, setReviewData, setOpenReview, callStartTime, setCallStartTime, isCallMinimized, setIsCallMinimized, isReconnecting, networkDisconnected, recoverCallAfterSystemDisconnect } = useCall();
  const { activeChat, setActiveChat } = useChatContext();
  const navigate = useNavigate();

  if (!activeCall || activeCall.callType !== "audio") {
    return null;
  }

  const { roomId, agoraToken, callerName, isUserSide } = callData;
  const shouldSkipReview = Boolean(activeChat?.roomId || activeCall?.resumeToChat);

  /* ================= REFS ================= */
  const clientRef = useRef(null);
  const micTrackRef = useRef(null);
  const cleanupRef = useRef(false);
  const videoTrackRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const userLeftTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const unmountedRef = useRef(false); // Prevents stale Agora callbacks after unmount
  // Track if this mount is a refresh-resume (activeCall restored from sessionStorage)
  const isResumeFromRefresh = useRef(!!sessionStorage.getItem("shubhtalk_active_call"));
  const isDowngradingRef = useRef(false); // Track if downgrading from video

  /* ================= STATE ================= */
  const [micOn, setMicOn] = useState(true);
  const [joined, setJoined] = useState(false);
  const [callState, setCallState] = useState("connecting");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isVideo, setIsVideo] = useState(false);
  const [isRemoteVideo, setIsRemoteVideo] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRemedyOpen, setIsRemedyOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [submitReport, { isLoading: isReportSubmitting }] = useSubmitReportMutation();

  /* ================= PREVENT ACCIDENTAL REFRESH & DETECT REFRESH ================= */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      isRefreshingRef.current = true;
      // Persist active call and callStartTime for resume after refresh
      sessionStorage.setItem("shubhtalk_active_call", JSON.stringify(activeCall));
      if (callStartTime) {
        sessionStorage.setItem("shubhtalk_call_start_time", String(callStartTime));
      }
      console.log("[VoiceCall] 🔄 beforeunload fired — isRefreshing=true, roomId:", roomId);
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeCall, callStartTime, roomId]);

  /* ================= START CALL ================= */
  useEffect(() => {
    cleanupRef.current = false;
    unmountedRef.current = false;

    const startCall = async () => {
      try {
        // If we're reconnecting after network drop, don't try to rejoin Agora
        // The existing Agora client will handle reconnection automatically
        if (isReconnecting || networkDisconnected) {
          console.log("[VoiceCall] 🔄 Skipping Agora join - reconnection in progress");
          return;
        }

        // Check if we're downgrading from video call
        // Primary check: isDowngrading flag (set by IncomingCallModal before callType changes)
        // Fallback: check if we have an active client with mic (meaning we're reusing a connection)
        const shouldDowngrade = sharedAgoraState.isDowngrading || 
                                (sharedAgoraState.client && 
                                 sharedAgoraState.micTrack && 
                                 !sharedAgoraState.isUpgrading);

        if (shouldDowngrade) {
          console.log("🔽 Downgrading from video to audio - reusing connection");
          
          // Verify client is still available
          if (!sharedAgoraState.client || !sharedAgoraState.micTrack) {
            console.error("❌ [DOWNGRADE] Client or mic track is null! Cannot downgrade.");
            console.error("❌ [DOWNGRADE] Client:", !!sharedAgoraState.client, "Mic:", !!sharedAgoraState.micTrack);
            console.error("❌ [DOWNGRADE] Starting fresh call instead.");
            // Fall through to fresh call setup
          } else {
            // Reuse existing client and mic track
            clientRef.current = sharedAgoraState.client;
            micTrackRef.current = sharedAgoraState.micTrack;
            
            console.log("✅ [DOWNGRADE] Client and mic track assigned");
            console.log("📹 Unpublishing and closing camera track...");
            
            // Unpublish and close camera track (may already be done by VideoCall cleanup)
            if (sharedAgoraState.cameraTrack) {
              try {
                await clientRef.current.unpublish([sharedAgoraState.cameraTrack]);
                sharedAgoraState.cameraTrack.stop();
                sharedAgoraState.cameraTrack.close();
                console.log("✅ Camera track closed successfully");
              } catch (err) {
                console.warn("[DOWNGRADE] Camera track cleanup (may already be done by VideoCall):", err.message);
              }
            } else {
              console.log("ℹ️ [DOWNGRADE] Camera track already cleaned up by VideoCall");
            }
            
            // Remove old VideoCall event listeners and add new VoiceCall listeners
            console.log("🔄 [DOWNGRADE] Removing old event listeners and adding new ones");
            if (clientRef.current) {
              clientRef.current.removeAllListeners();
              
              // Add VoiceCall event listeners
              clientRef.current.on("user-published", async (user, mediaType) => {
                // Cancel any pending end-call grace timer — remote user is back
                if (userLeftTimerRef.current) {
                  clearTimeout(userLeftTimerRef.current);
                  userLeftTimerRef.current = null;
                  console.log("[DOWNGRADE] ✅ user-published: cancelled pending endCall grace timer");
                }

                console.log(`📹 [DOWNGRADE] User published ${mediaType}:`, user.uid);
                await clientRef.current.subscribe(user, mediaType);
                
                if (mediaType === "audio") {
                  user.audioTrack?.play();
                  if (user.audioTrack) {
                    user.audioTrack.setVolume(speakerOn ? 100 : 0);
                  }
                }

                if (mediaType === "video") {
                  setIsRemoteVideo(true);
                  if (remoteVideoRef.current && user.videoTrack) {
                    user.videoTrack.play(remoteVideoRef.current);
                  }
                }
              });

              clientRef.current.on("user-unpublished", async (user, mediaType) => {
                console.log(`📹 [DOWNGRADE] User unpublished ${mediaType}:`, user.uid);
                if (mediaType === "video") {
                  setIsRemoteVideo(false);
                }
              });

              // Grace period so a page refresh doesn't kill the call
              clientRef.current.on("user-left", (user) => {
                // If upgrading to video, ignore user-left
                if (isUpgradingRef.current || upgradeRejectionRef.current) {
                  console.log("⚠️ [DOWNGRADE] Ignoring user-left — upgrade in progress");
                  return;
                }
                // Ignore if VoiceCall already unmounted (stale Agora callback)
                if (unmountedRef.current) {
                  console.log("⚠️ [DOWNGRADE] Ignoring user-left — component already unmounted");
                  return;
                }
                // Use shorter grace period when call was initiated from chat
                const isChatInitiated = Boolean(activeChat?.roomId || activeCall?.resumeToChat);
                const graceMs = isChatInitiated ? 5000 : 60000;
                console.log(`[DOWNGRADE] 👋 user-left — uid: ${user.uid}, starting ${graceMs / 1000}s grace timer (chatInitiated: ${isChatInitiated})`);
                if (userLeftTimerRef.current) clearTimeout(userLeftTimerRef.current);
                userLeftTimerRef.current = setTimeout(() => {
                  if (isUpgradingRef.current || unmountedRef.current) {
                    console.log("⚠️ [DOWNGRADE] Grace timer fired but upgrade/unmount in progress — ignoring");
                    return;
                  }
                  console.log("[DOWNGRADE] ⏰ user-left grace timer expired — ending call");
                  handleRemoteUserLeft();
                }, graceMs);
              });

              clientRef.current.on("user-joined", (user) => {
                console.log("[DOWNGRADE] 🤝 user-joined — uid:", user.uid);
                // User reconnected — cancel the pending end-call
                if (userLeftTimerRef.current) {
                  clearTimeout(userLeftTimerRef.current);
                  userLeftTimerRef.current = null;
                  console.log("[DOWNGRADE] ✅ user-joined: cancelled pending endCall grace timer");
                }
              });
            }
            
            // Update shared state (clear camera, keep client and mic)
            setSharedAgoraState(prev => ({
              ...prev,
              cameraTrack: null,
              // Keep isDowngrading flag for now - will clear it after remote user check
            }));
            
            setJoined(true);
            setCallState("connected");
            
            // 🔥 CRITICAL: Ensure remote audio is playing after downgrade
            // Store client ref locally to avoid race condition
            const currentClient = clientRef.current;
            setTimeout(() => {
              console.log("🔍 [DOWNGRADE] Checking for existing remote users...");
              
              if (!currentClient) {
                console.warn("⚠️ [DOWNGRADE] currentClient is null, skipping remote user check");
                // Still clear the flag even if client is null
                setSharedAgoraState(prev => ({
                  ...prev,
                  isDowngrading: false
                }));
                return;
              }
              
              try {
                const remoteUsers = currentClient.remoteUsers;
                console.log(`📊 [DOWNGRADE] Found ${remoteUsers.length} remote users`);
                
                for (const user of remoteUsers) {
                  console.log(`👤 [DOWNGRADE] Remote user ${user.uid}:`, {
                    hasVideo: user.hasVideo,
                    hasAudio: user.hasAudio,
                    videoTrack: !!user.videoTrack,
                    audioTrack: !!user.audioTrack
                  });

                  // Ensure audio is playing
                  if (user.audioTrack) {
                    console.log(`🔊 [DOWNGRADE] Playing audio from user ${user.uid}`);
                    user.audioTrack.play();
                    user.audioTrack.setVolume(speakerOn ? 100 : 0);
                  }
                }
              } catch (err) {
                console.error("❌ [DOWNGRADE] Error checking remote users:", err);
              }
              
              // Clear the downgrade flag after everything is set up
              console.log("✅ [DOWNGRADE] Complete - clearing isDowngrading flag");
              setSharedAgoraState(prev => ({
                ...prev,
                isDowngrading: false
              }));
            }, 500);
            
            return;
          }
        }

        // Fresh audio call - normal flow
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          // Cancel any pending end-call grace timer — remote user is back
          if (userLeftTimerRef.current) {
            clearTimeout(userLeftTimerRef.current);
            userLeftTimerRef.current = null;
            console.log("[VoiceCall] ✅ user-published: cancelled pending endCall grace timer");
          }

          await client.subscribe(user, mediaType);
          if (mediaType === "audio") {
            user.audioTrack?.play();
            // Set initial volume based on speaker state
            if (user.audioTrack) {
              user.audioTrack.setVolume(speakerOn ? 100 : 0);
            }
          }

          if (mediaType === "video") {
            setIsRemoteVideo(true);
            if (remoteVideoRef.current && user.videoTrack) {
              user.videoTrack.play(remoteVideoRef.current);
            }
          }
        });

        client.on("user-unpublished", async (user, mediaType) => {
          if (mediaType === "video") {
            setIsRemoteVideo(false)
          }
        });

        // Grace period so a page refresh doesn't kill the call
        client.on("user-left", (user) => {
          // If upgrading to video, ignore user-left
          if (isUpgradingRef.current || upgradeRejectionRef.current) {
            console.log("⚠️ Ignoring user-left — upgrade in progress");
            return;
          }
          // Ignore if VoiceCall already unmounted (stale Agora callback)
          if (unmountedRef.current) {
            console.log("⚠️ [VoiceCall] Ignoring user-left — component already unmounted");
            return;
          }
          // Use shorter grace period when call was initiated from chat,
          // since user likely disconnected intentionally to return to chat
          const isChatInitiated = Boolean(activeChat?.roomId || activeCall?.resumeToChat);
          const graceMs = isChatInitiated ? 5000 : 60000;
          console.log(`[VoiceCall] 👋 user-left — uid: ${user.uid}, starting ${graceMs / 1000}s grace timer (chatInitiated: ${isChatInitiated})`);
          if (userLeftTimerRef.current) clearTimeout(userLeftTimerRef.current);
          userLeftTimerRef.current = setTimeout(() => {
            // Double-check upgrade/unmount state when timer fires
            if (isUpgradingRef.current || unmountedRef.current) {
              console.log("⚠️ [VoiceCall] Grace timer fired but upgrade/unmount in progress — ignoring");
              return;
            }
            console.log("[VoiceCall] ⏰ user-left grace timer expired — ending call");
            handleRemoteUserLeft();
          }, graceMs);
        });

        client.on("user-joined", (user) => {
          console.log("[VoiceCall] 🤝 user-joined — uid:", user.uid);
          // User reconnected — cancel the pending end-call
          if (userLeftTimerRef.current) {
            clearTimeout(userLeftTimerRef.current);
            userLeftTimerRef.current = null;
            console.log("[VoiceCall] ✅ user-joined: cancelled pending endCall grace timer");
          }
        });

        await client.join(APP_ID, roomId, agoraToken, "");

        // Clear the resume flag now that we've successfully rejoined
        if (isResumeFromRefresh.current) {
          console.log("[VoiceCall] 🔄 Clearing isResumeFromRefresh flag (Agora joined successfully)");
          setTimeout(() => {
            isResumeFromRefresh.current = false;
            console.log("[VoiceCall] ✅ isResumeFromRefresh cleared");
          }, 5000);
        }

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
      } catch (err) {
        console.error("VOICE CALL START ERROR", err);
        
        // Don't cleanup on network errors during reconnection - let the reconnection logic handle it
        const isNetworkError = err?.code === "CAN_NOT_GET_GATEWAY_SERVER" || 
                               err?.message?.includes("CAN_NOT_GET_GATEWAY_SERVER") ||
                               err?.message?.includes("network");
        
        if (isNetworkError && (isReconnecting || networkDisconnected)) {
          console.log("[VoiceCall] 🔄 Network error during reconnection - waiting for network to stabilize");
          return;
        }
        
        await cleanup();
      }
    };

    startCall();

    return () => {
      console.log("[VoiceCall] 🧹 useEffect cleanup (unmount) — isRefreshing:", isRefreshingRef.current);
      unmountedRef.current = true;
      // Always clear the user-left grace timer on unmount to prevent stale
      // callbacks from killing a newly upgraded video call
      if (userLeftTimerRef.current) {
        clearTimeout(userLeftTimerRef.current);
        userLeftTimerRef.current = null;
      }
      // If upgrading to video, skip Agora resource cleanup (client/tracks are shared)
      if (isUpgradingRef.current || sharedAgoraState.isUpgrading) {
        console.log("🔄 Skipping cleanup - upgrading to video");
        return;
      }
      // On refresh: only release Agora resources, do NOT clear activeCall
      // so it persists in sessionStorage for reconnect
      try {
        micTrackRef.current?.stop();
        micTrackRef.current?.close();
        videoTrackRef.current?.stop();
        videoTrackRef.current?.close();
        clientRef.current?.leave();
      } catch (e) {
        console.warn("[VoiceCall] Voice unmount cleanup error:", e);
      }
      micTrackRef.current = null;
      videoTrackRef.current = null;
      clientRef.current = null;
    };
    // eslint-disable-next-line
  }, [roomId]);

  /* ================= WATCH FOR UPGRADE ================= */
  useEffect(() => {
    isUpgradingRef.current = sharedAgoraState.isUpgrading;
  }, [sharedAgoraState.isUpgrading]);

  /* ================= WATCH FOR DOWNGRADE ================= */
  useEffect(() => {
    isDowngradingRef.current = sharedAgoraState.isDowngrading;
  }, [sharedAgoraState.isDowngrading]);
  /* ================= MIC TOGGLE ================= */
  useEffect(() => {
    micTrackRef.current?.setEnabled(micOn);
  }, [micOn]);

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

  /* ================= TIMER (local count-up) ================= */
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    let interval;
    if (callState === "connected") {
      if (!callStartTime) {
        // Check sessionStorage first (refresh resume)
        const savedStartTime = sessionStorage.getItem("shubhtalk_call_start_time");
        if (savedStartTime && Number(savedStartTime) > 0) {
          setCallStartTime(Number(savedStartTime));
        } else {
          setCallStartTime(Date.now());
        }
      }
      interval = setInterval(() => {
        if (callStartTime) {
          setTimer(Math.floor((Date.now() - callStartTime) / 1000));
        }
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [callState, callStartTime]);

  /* ================= CLEANUP ================= */
  const cleanup = async () => {
    if (cleanupRef.current) return;
    cleanupRef.current = true;

    if (userLeftTimerRef.current) {
      clearTimeout(userLeftTimerRef.current);
      userLeftTimerRef.current = null;
    }

    try {
      // If upgrading or downgrading, don't close anything - just hand over
      if (isUpgradingRef.current) {
        console.log("🔄 Cleanup skipped - preserving connection for upgrade");
        return;
      }

      if (isDowngradingRef.current) {
        console.log("🔽 Cleanup skipped - preserving connection for downgrade");
        return;
      }

      // Normal cleanup - close everything
      // Use try-catch for each operation to prevent one failure from blocking others
      try {
        micTrackRef.current?.stop();
        micTrackRef.current?.close();
      } catch (e) {
        console.warn("[VoiceCall] Mic track cleanup error:", e.message);
      }
      
      try {
        videoTrackRef.current?.stop();
        videoTrackRef.current?.close();
      } catch (e) {
        console.warn("[VoiceCall] Video track cleanup error:", e.message);
      }
      
      // Only attempt to leave if client exists
      // Use .catch() to completely suppress WS_ABORT errors during network drops
      if (clientRef.current) {
        const connectionState = clientRef.current.connectionState;
        if (connectionState === "CONNECTED" || connectionState === "CONNECTING") {
          clientRef.current.leave().catch((e) => {
            // Silently ignore - WS_ABORT is expected during network drops
            console.warn("[VoiceCall] Client leave error (safe to ignore):", e.message);
          });
        }
      }
    } catch (e) {
      console.warn("Voice cleanup error:", e);
    } finally {
      micTrackRef.current = null;
      clientRef.current = null;
      sessionStorage.removeItem("shubhtalk_active_call");
      sessionStorage.removeItem("shubhtalk_call_start_time");

      // Only clear active call and shared state if not upgrading or downgrading
      if (!isUpgradingRef.current && !isDowngradingRef.current) {
        setActiveCall(null);
        setSharedAgoraState({
          client: null,
          micTrack: null,
          cameraTrack: null,
          isUpgrading: false,
          isDowngrading: false
        });
      }
      setCallStartTime(null);
    }
  };

  /* ================= END CALL (User initiated) ================= */

  const handleReportSubmit = async (values) => {
    try {
      const res = await submitReport({
        reasonId: values.reasonId,
        userId: activeCall?.userId,
        // astrologerId: activeCall?.astrologerId,
        description: values.description,
      }).unwrap();

      if (res?.success) {
        Toast.success(res?.message || "Report submitted successfully");
      } else {
        Toast.error(res?.message || "Failed to submit report");
      }

      setShowReportModal(false);
      endCall();
    } catch (err) {
      Toast.error(err?.data?.message || "Failed to submit report");
    }
  };

  const endCall = async () => {
    // Don't emit call:end if upgrading or downgrading
    if (isUpgradingRef.current || sharedAgoraState.isUpgrading) {
      console.log("🔄 Skipping call:end emit - upgrading to video");
      return;
    }

    if (isDowngradingRef.current) {
      console.log("🔽 Skipping call:end emit - downgrading from video");
      return;
    }

    console.log("📞 User initiated call end - emitting call:end");
    voiceSocket.emit("call:end", {
      roomId,
      endedBy: isUserSide ? "CUSTOMER" : "ASTROLOGER",
    });
    setReviewData({
      userID: activeCall?.userID,
      fullName: activeCall?.callerName,
      roomId: activeCall?.roomId,
    });
    // Don't show review popup if chat is still active
    if (!shouldSkipReview) {
      setOpenReview(true);
    }
    await cleanup();
  };

  /* ================= HANDLE REMOTE USER LEFT (Remote initiated) ================= */
  const handleRemoteUserLeft = async () => {
    // Check if we're upgrading or downgrading - don't end call if switching
    if (isUpgradingRef.current || isDowngradingRef.current || upgradeRejectionRef.current || sharedAgoraState.isUpgrading) {
      console.log("⚠️ Ignoring remote user left - call type switch in progress");
      return;
    }

    console.log("📞 Remote user left - cleaning up without emitting call:end");
    // Don't emit call:end - the remote user already ended it
    setReviewData({
      userID: activeCall?.userID,
      fullName: activeCall?.callerName,
      roomId: activeCall?.roomId,
    });
    // Don't show review popup if chat is still active
    if (!shouldSkipReview) {
      setOpenReview(true);
    }
    await cleanup();
  };

  /* ================= HANDLE SERVER CALL END (Server/Remote initiated) ================= */
  const handleServerCallEnd = async () => {
    // Check if we're upgrading or downgrading - don't end call if switching
    if (isUpgradingRef.current || isDowngradingRef.current || upgradeRejectionRef.current || isUpgradeRejectionProtected || sharedAgoraState.isUpgrading) {
      console.log("⚠️ Ignoring server call end - call type switch in progress");
      return;
    }

    console.log("📞 Server/Remote ended call - cleaning up without emitting call:end");
    // Don't emit call:end - the server/remote already ended it
    setReviewData({
      userID: activeCall?.userID,
      fullName: activeCall?.callerName,
      roomId: activeCall?.roomId,
    });
    // Don't show review popup if chat is still active
    if (!shouldSkipReview) {
      setOpenReview(true);
    }
    await cleanup();
  };

  // Use ref to always have the latest handler available for socket listeners
  const handleServerCallEndRef = useRef(handleServerCallEnd);
  handleServerCallEndRef.current = handleServerCallEnd;

  const handleCallCanceled = async () => {
    await cleanup();
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    console.log("[VoiceCall] Setting up socket listeners for room:", roomId);
    console.log("[VoiceCall] Socket connected:", voiceSocket.connected, "Socket ID:", voiceSocket.id);
    
    const handleCallEnded = (data) => {
      console.log("📞 call:ended event received:", data);
      if (data?.roomId && data.roomId !== roomId) {
        return;
      }

      if (recoverCallAfterSystemDisconnect(data)) {
        return;
      }

      handleServerCallEndRef.current();
    };

    const handleForceCallEnd = (data) => {
      console.log("📞 force_call_end event received:", data);
      handleServerCallEndRef.current();
    };

    // NOTE: We no longer listen to socket 'disconnect' here.
    // The CallContext handles reconnection logic on socket disconnect.
    // The call will only end when backend explicitly sends 'call:ended'.

    const handleCallRejected = (data) => {
      console.log("📞 call:rejected event received:", data);
      if (data.roomId == roomId) {
        handleServerCallEndRef.current();
      }
    };

    // const handleCanceled = async () => {
    //   await cleanup();
    // };
    
    voiceSocket.on("call:ended", handleCallEnded);
    voiceSocket.on("force_call_end", handleForceCallEnd);
    voiceSocket.on("call:rejected", handleCallRejected);
    // voiceSocket.on("call:canceled", handleCanceled);

    return () => {
      console.log("[VoiceCall] Cleaning up socket listeners for room:", roomId);
      voiceSocket.off("call:ended", handleCallEnded);
      voiceSocket.off("force_call_end", handleForceCallEnd);
      voiceSocket.off("call:rejected", handleCallRejected);
      // voiceSocket.off("call:canceled", handleCanceled);
    };
  }, [roomId]); // Only depend on roomId

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
    // Set active chat context before navigating
    setActiveChat({
      roomId: activeCall.chatRoomId,
      userId: activeCall.userId,
      astrologerId: activeCall.astrologerId,
      remainingTime: activeCall.remainingTime || 0
    });

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
  /* ================= KUNDLI / CHAT PANEL ================= */
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  const chatData = {
    userId: activeCall?.userId,
    astrologerId: activeCall?.astrologerId,
    chatRoomId: activeCall?.chatRoomId,
    kundliId: activeCall?.kundliId,
    isUserSide: activeCall?.isUserSide,
  };

  /* ================= UI ================= */
  return (
    <>
      {/* RECONNECTING OVERLAY */}
      <ReconnectingOverlay 
        isVisible={networkDisconnected || isReconnecting} 
        message={isReconnecting ? "Reconnecting..." : "Connection lost..."} 
      />
      
      {/* MINI VIEW */}
      {isCallMinimized && (
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
              <p className="text-sm font-semibold capitalize truncate max-w-[120px]">{callerName}</p>
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
              onClick={(e) => { e.stopPropagation(); endCall(); }}
              className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
              title="End Call"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 010-1.36C3.42 8.63 7.46 7 12 7s8.58 1.63 11.71 4.72c.18.18.29.44.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85a.993.993 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
              </svg>
            </button>

            <button
              onClick={() => setIsCallMinimized(false)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              ⤢
            </button>
          </div>
        </div>
      )}

      {/* FULL VIEW - NEW DESIGN */}
      {!isCallMinimized && (
        <div className="fixed inset-0 z-[99999] flex flex-col" style={{ backgroundColor: isRemoteVideo ? 'transparent' : 'white' }}>

          {/* HEADER */}
          <div
            className="flex items-center justify-between px-4 md:px-6 py-3 border-b z-50 transition-all duration-300"
            style={{
              position: isRemoteVideo ? 'absolute' : 'relative',
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: isRemoteVideo ? 'rgba(0, 0, 0, 0.3)' : 'white',
              backdropFilter: isRemoteVideo ? 'blur(10px)' : 'none',
              borderColor: isRemoteVideo ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'
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
                  style={{ color: isRemoteVideo ? 'white' : '#111827' }}
                >
                  {callerName}
                </h2>
              </div>
            </div>

            {/* Desktop View - Chat icon, Video icon, Timer, End button */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={openChatWithMinimize}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{
                  borderColor: '#f75801'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 17 17" fill="none">
                  <path d="M15 0H1.66667C0.75 0 0.00833333 0.75 0.00833333 1.66667L0 16.6667L3.33333 13.3333H15C15.9167 13.3333 16.6667 12.5833 16.6667 11.6667V1.66667C16.6667 0.75 15.9167 0 15 0ZM4.16667 5.83333H12.5C12.9583 5.83333 13.3333 6.20833 13.3333 6.66667C13.3333 7.125 12.9583 7.5 12.5 7.5H4.16667C3.70833 7.5 3.33333 7.125 3.33333 6.66667C3.33333 6.20833 3.70833 5.83333 4.16667 5.83333ZM9.16667 10H4.16667C3.70833 10 3.33333 9.625 3.33333 9.16667C3.33333 8.70833 3.70833 8.33333 4.16667 8.33333H9.16667C9.625 8.33333 10 8.70833 10 9.16667C10 9.625 9.625 10 9.16667 10ZM12.5 5H4.16667C3.70833 5 3.33333 4.625 3.33333 4.16667C3.33333 3.70833 3.70833 3.33333 4.16667 3.33333H12.5C12.9583 3.33333 13.3333 3.70833 13.3333 4.16667C13.3333 4.625 12.9583 5 12.5 5Z" fill="url(#paint0_linear_desktop_chat_voice)" />
                  <defs>
                    <linearGradient id="paint0_linear_desktop_chat_voice" x1="0" y1="8.33333" x2="16.6667" y2="8.33333" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F75801" />
                      <stop offset="1" stopColor="#D43400" />
                    </linearGradient>
                  </defs>
                </svg>
              </button>

              <div className="w-px h-6 bg-gray-300"></div>

              <button
                onClick={toggleCamera}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{
                  borderColor: '#f75801'
                }}
              >
                {isVideo ? (
                  <img src={CallIcon} alt="Audio" width="20" height="20" style={{ filter: 'invert(45%) sepia(94%) saturate(2477%) hue-rotate(356deg) brightness(101%) contrast(98%)' }} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="13" viewBox="0 0 17 11" fill="none">
                    <path d="M12.8333 4.125V0.916667C12.8333 0.4125 12.4208 0 11.9167 0H0.916667C0.4125 0 0 0.4125 0 0.916667V10.0833C0 10.5875 0.4125 11 0.916667 11H11.9167C12.4208 11 12.8333 10.5875 12.8333 10.0833V6.875L14.9325 8.97417C15.51 9.55167 16.5 9.13917 16.5 8.32333V2.6675C16.5 1.85167 15.51 1.43917 14.9325 2.01667L12.8333 4.125Z" fill="url(#paint0_linear_desktop_voice)" />
                    <defs>
                      <linearGradient id="paint0_linear_desktop_voice" x1="0" y1="5.5" x2="16.5" y2="5.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F75801" />
                        <stop offset="1" stopColor="#D43400" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
              </button>

              <span
                className="text-sm font-medium ml-2 transition-colors duration-300"
                style={{ color: isRemoteVideo ? 'white' : '#374151' }}
              >
                <span className="text-red-500 font-semibold">{formatTime(timer)}</span>
              </span>

              <button
                onClick={toggleChat}
                className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}
              >
                View Kundli
              </button>
            </div>

            {/* Mobile View - Timer and View Kundli button */}
            <div className="md:hidden flex items-center gap-3">
              <span className="text-sm font-semibold text-red-500">{formatTime(timer)}</span>

              <button
                onClick={toggleChat}
                className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}
              >
                View Kundli
              </button>
            </div>
          </div>

          {/* Mobile Chat & Video Buttons - Part of sticky header */}
          <div
            className="md:hidden flex gap-3 px-4 py-3 border-b z-50 transition-all duration-300"
            style={{
              position: isRemoteVideo ? 'absolute' : 'relative',
              top: isRemoteVideo ? '60px' : 'auto',
              left: 0,
              right: 0,
              backgroundColor: isRemoteVideo ? 'rgba(0, 0, 0, 0.3)' : '#FFF8F0',
              backdropFilter: isRemoteVideo ? 'blur(10px)' : 'none',
              borderColor: isRemoteVideo ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'
            }}
          >
            <button
              onClick={openChatWithMinimize}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 hover:opacity-90 transition-all duration-300"
              style={{
                borderColor: '#f75801',
                backgroundColor: isRemoteVideo ? 'rgba(255, 255, 255, 0.1)' : 'white',
                backdropFilter: isRemoteVideo ? 'blur(10px)' : 'none'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 17 17" fill="none">
                <path d="M15 0H1.66667C0.75 0 0.00833333 0.75 0.00833333 1.66667L0 16.6667L3.33333 13.3333H15C15.9167 13.3333 16.6667 12.5833 16.6667 11.6667V1.66667C16.6667 0.75 15.9167 0 15 0ZM4.16667 5.83333H12.5C12.9583 5.83333 13.3333 6.20833 13.3333 6.66667C13.3333 7.125 12.9583 7.5 12.5 7.5H4.16667C3.70833 7.5 3.33333 7.125 3.33333 6.66667C3.33333 6.20833 3.70833 5.83333 4.16667 5.83333ZM9.16667 10H4.16667C3.70833 10 3.33333 9.625 3.33333 9.16667C3.33333 8.70833 3.70833 8.33333 4.16667 8.33333H9.16667C9.625 8.33333 10 8.70833 10 9.16667C10 9.625 9.625 10 9.16667 10ZM12.5 5H4.16667C3.70833 5 3.33333 4.625 3.33333 4.16667C3.33333 3.70833 3.70833 3.33333 4.16667 3.33333H12.5C12.9583 3.33333 13.3333 3.70833 13.3333 4.16667C13.3333 4.625 12.9583 5 12.5 5Z" fill="url(#paint0_linear_mobile_chat_voice)" />
                <defs>
                  <linearGradient id="paint0_linear_mobile_chat_voice" x1="0" y1="8.33333" x2="16.6667" y2="8.33333" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F75801" />
                    <stop offset="1" stopColor="#D43400" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-base font-medium" style={{ color: '#f75801' }}>Chat</span>
            </button>

            <button
              onClick={toggleCamera}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 hover:opacity-90 transition-all duration-300"
              style={{
                borderColor: '#f75801',
                backgroundColor: isRemoteVideo ? 'rgba(255, 255, 255, 0.1)' : 'white',
                backdropFilter: isRemoteVideo ? 'blur(10px)' : 'none'
              }}
            >
              {isVideo ? (
                <img src={CallIcon} alt="Audio" width="22" height="22" style={{ filter: 'invert(45%) sepia(94%) saturate(2477%) hue-rotate(356deg) brightness(101%) contrast(98%)' }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="15" viewBox="0 0 17 11" fill="none">
                  <path d="M12.8333 4.125V0.916667C12.8333 0.4125 12.4208 0 11.9167 0H0.916667C0.4125 0 0 0.4125 0 0.916667V10.0833C0 10.5875 0.4125 11 0.916667 11H11.9167C12.4208 11 12.8333 10.5875 12.8333 10.0833V6.875L14.9325 8.97417C15.51 9.55167 16.5 9.13917 16.5 8.32333V2.6675C16.5 1.85167 15.51 1.43917 14.9325 2.01667L12.8333 4.125Z" fill="url(#paint0_linear_mobile_voice)" />
                  <defs>
                    <linearGradient id="paint0_linear_mobile_voice" x1="0" y1="5.5" x2="16.5" y2="5.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F75801" />
                      <stop offset="1" stopColor="#D43400" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
              <span className="text-base font-medium" style={{ color: '#f75801' }}>{isVideo ? "Audio" : "Video"}</span>
            </button>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white relative">

            {/* REMOTE VIDEO (ALWAYS MOUNTED) */}
            <div
              ref={remoteVideoRef}
              className={`absolute inset-0 bg-black ${isRemoteVideo ? "block" : "hidden"}`}
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* LOCAL VIDEO (PiP) */}
            {isVideo && (
              <div
                ref={localVideoRef}
                className="absolute rounded-xl overflow-hidden bg-black border-2 border-white shadow-lg"
                style={{
                  top: isRemoteVideo ? '180px' : '16px',
                  right: '16px',
                  width: '128px',
                  height: '160px',
                  zIndex: 100
                }}
              />
            )}

            {/* PROFILE AREA WITH SPACING - ONLY WHEN NO VIDEO */}
            {!isRemoteVideo && (
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
                  {formatTime(timer)}
                </h3>
              </div>
            )}

            {/* BOTTOM CONTROLS SECTION - FIXED AT BOTTOM */}
            <div
              className={`${isRemoteVideo ? 'absolute bottom-0' : ''} left-0 right-0 z-20`}
              style={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* SUGGEST REMEDY BUTTON - Blurred Background */}
              <div
                style={{
                  backdropFilter: isRemoteVideo ? 'blur(20px)' : 'none',
                  background: isRemoteVideo ? 'rgba(100, 100, 100, 0.4)' : 'transparent',
                  padding: '20px 0',
                  display: 'flex',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
              >
                <button onClick={() => setIsRemedyOpen(true)} className="px-8 py-3 text-white rounded-full text-base font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}>
                  Suggest Remedy
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </button>
              </div>

              {/* CONTROL BUTTONS - Solid Black Background */}
              <div
                style={{
                  background: isRemoteVideo ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
                  padding: '24px 20px 32px 20px',
                  transition: 'all 0.3s'
                }}
              >
                <div className="flex items-center justify-center gap-8 md:gap-6">

                  {/* MUTE BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setMicOn(m => !m)}
                      className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      {micOn ? (
                        <IoMic size={28} style={{ color: '#f75801' }} />
                      ) : (
                        <IoMicOff size={28} style={{ color: '#f75801' }} />
                      )}
                    </button>
                    <span className={`text-sm font-medium ${isRemoteVideo ? 'text-white' : 'text-gray-600'}`}>
                      {micOn ? "Mute" : "Unmute"}
                    </span>
                  </div>

                  {/* END CALL BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={endCall}
                      className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <IoCallSharp color="white" size={24} />
                    </button>
                    <span className={`text-sm font-medium ${isRemoteVideo ? 'text-white' : 'text-gray-600'}`}>End Call</span>
                  </div>

                  {/* SPEAKER BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setSpeakerOn(s => !s)}
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
                    <span className={`text-sm font-medium ${isRemoteVideo ? 'text-white' : 'text-gray-600'}`}>
                      Speaker {speakerOn ? "On" : "Off"}
                    </span>
                  </div>

{/* Report Caller */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 20h20L12 2z" fill="white" />
                        <rect x="11" y="8" width="2" height="6" fill="#ef4444" rx="1" />
                        <circle cx="12" cy="17" r="1" fill="#ef4444" />
                      </svg>
                    </button>
                    <span className={`text-sm font-medium ${isRemoteVideo ? 'text-white' : 'text-gray-600'}`}>Report Caller</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
          {/* Kundli / Chat Panel */}
          {isChatOpen && (
            <VideoCallChat
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              videoCallData={chatData}
            />
          )}
          {/* Suggest Remedy Panel */}
          <SuggestRemedyPanel
            isOpen={isRemedyOpen}
            onClose={() => setIsRemedyOpen(false)}
            roomId={activeCall?.chatRoomId || roomId}
          />

          {/* Report Caller Modal */}
          <ReportCaller
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReportSubmit}
            isSubmitting={isReportSubmitting}
            callerName={callerName}
          />
        </div>
      )}
    </>
  );
};

export default AgoraVoiceCalling;
