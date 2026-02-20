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
import { useChat as useChatContext } from "../../../context/chatContext";

const APP_ID = "5630460abdc141e3b2f8d9597752bd7d";

const AgoraVoiceCalling = ({ callData }) => {
  const { activeCall, setActiveCall } = useCall();
  const { setActiveChat } = useChatContext();
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
  const [speakerOn, setSpeakerOn] = useState(true);

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
          // Set initial volume based on speaker state
          if (user.audioTrack) {
            user.audioTrack.setVolume(speakerOn ? 100 : 0);
          }
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

      client.on("user-left", endCall);

      await client.join(APP_ID, roomId, agoraToken, null);

      micTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([micTrackRef.current]);
      // videoTrackRef.current = await AgoraRTC.createCameraVideoTrack();

      setJoined(true);
      setCallState("connected");
    };

    startCall();

    return () => cleanup();
    // eslint-disable-next-line
  }, [roomId]);

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
      setActiveCall(null);
    }
  };

  /* ================= END CALL ================= */
  const endCall = async () => {
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
    voiceSocket.on("call:ended", endCall);
    voiceSocket.on("force_call_end", endCall);
    voiceSocket.on("disconnect", endCall);
    voiceSocket.on("call:canceled", handleCallCanceled);

    return () => {
      voiceSocket.off("call:ended", endCall);
      voiceSocket.off("force_call_end", endCall);
      voiceSocket.off("disconnect", endCall);
      voiceSocket.off("call:canceled", handleCallCanceled);
    };
  }, []);

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

      {/* FULL VIEW - NEW DESIGN */}
      {!isMinimized && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-white">
          
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={() => setIsMinimized(true)}
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
                <h2 className="text-sm font-semibold text-gray-900">{callerName}</h2>
                <span className="text-xs text-gray-500">Exp. 1 year</span>
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
                <IoChatbubbleEllipses size={20} style={{ color: '#f75801' }} />
              </button>

              <div className="w-px h-6 bg-gray-300"></div>

              <button 
                onClick={toggleCamera}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ 
                  borderColor: '#f75801'
                }}
              >
                {isVideo ? <IoVideocamOff size={20} style={{ color: '#f75801' }} /> : <IoVideocam size={20} style={{ color: '#f75801' }} />}
              </button>

              <span className="text-sm font-medium text-gray-700 ml-2">
                Call Ends in <span className="text-red-500 font-semibold">{formatTime(timer)}</span>
              </span>

              <button
                onClick={endCall}
                className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_call_end)">
                    <path d="M7.12004 8.87333C7.79661 9.5505 8.56125 10.1335 9.39337 10.6067L10.24 9.76C10.4213 9.58076 10.6501 9.45723 10.8994 9.40406C11.1488 9.35089 11.4081 9.3703 11.6467 9.46C12.2516 9.6857 12.88 9.84225 13.52 9.92667C13.8404 9.97195 14.1334 10.1322 14.3443 10.3775C14.5553 10.6228 14.6699 10.9365 14.6667 11.26V13.26C14.6675 13.4457 14.6294 13.6294 14.555 13.7996C14.4807 13.9697 14.3716 14.1224 14.2348 14.2479C14.0979 14.3734 13.9364 14.469 13.7605 14.5285C13.5847 14.588 13.3983 14.61 13.2134 14.5933C11.1619 14.3704 9.19137 13.6694 7.46004 12.5467C6.65688 12.0367 5.91239 11.4398 5.24004 10.7667M3.46004 8.54C2.33727 6.80867 1.63628 4.83811 1.41337 2.78667C1.39671 2.60231 1.41862 2.41651 1.4777 2.24108C1.53679 2.06566 1.63175 1.90446 1.75655 1.76775C1.88134 1.63103 2.03324 1.5218 2.20256 1.44701C2.37189 1.37222 2.55493 1.33351 2.74004 1.33333H4.74004C5.06357 1.33015 5.37723 1.44472 5.62254 1.65569C5.86786 1.86666 6.02809 2.15963 6.07337 2.48C6.15779 3.12004 6.31434 3.74848 6.54004 4.35333C6.62973 4.59195 6.64915 4.85127 6.59597 5.10059C6.5428 5.3499 6.41928 5.57874 6.24004 5.76L5.39337 6.60667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.6666 1.33333L1.33325 14.6667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_call_end">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                End
              </button>
            </div>

            {/* Mobile View - Timer and End button */}
            <div className="md:hidden flex items-center gap-3">
              <span className="text-sm font-semibold text-red-500">{formatTime(timer)}</span>
              
              <button
                onClick={endCall}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_call_end_mobile)">
                    <path d="M7.12004 8.87333C7.79661 9.5505 8.56125 10.1335 9.39337 10.6067L10.24 9.76C10.4213 9.58076 10.6501 9.45723 10.8994 9.40406C11.1488 9.35089 11.4081 9.3703 11.6467 9.46C12.2516 9.6857 12.88 9.84225 13.52 9.92667C13.8404 9.97195 14.1334 10.1322 14.3443 10.3775C14.5553 10.6228 14.6699 10.9365 14.6667 11.26V13.26C14.6675 13.4457 14.6294 13.6294 14.555 13.7996C14.4807 13.9697 14.3716 14.1224 14.2348 14.2479C14.0979 14.3734 13.9364 14.469 13.7605 14.5285C13.5847 14.588 13.3983 14.61 13.2134 14.5933C11.1619 14.3704 9.19137 13.6694 7.46004 12.5467C6.65688 12.0367 5.91239 11.4398 5.24004 10.7667M3.46004 8.54C2.33727 6.80867 1.63628 4.83811 1.41337 2.78667C1.39671 2.60231 1.41862 2.41651 1.4777 2.24108C1.53679 2.06566 1.63175 1.90446 1.75655 1.76775C1.88134 1.63103 2.03324 1.5218 2.20256 1.44701C2.37189 1.37222 2.55493 1.33351 2.74004 1.33333H4.74004C5.06357 1.33015 5.37723 1.44472 5.62254 1.65569C5.86786 1.86666 6.02809 2.15963 6.07337 2.48C6.15779 3.12004 6.31434 3.74848 6.54004 4.35333C6.62973 4.59195 6.64915 4.85127 6.59597 5.10059C6.5428 5.3499 6.41928 5.57874 6.24004 5.76L5.39337 6.60667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.6666 1.33333L1.33325 14.6667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_call_end_mobile">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                End
              </button>
            </div>
          </div>

          {/* Mobile Chat & Video Buttons - Part of sticky header */}
          <div className="md:hidden flex gap-3 px-4 py-3 bg-[#FFF8F0] border-b border-gray-200">
            <button 
              onClick={openChatWithMinimize}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 bg-white hover:opacity-90 transition-opacity"
              style={{ borderColor: '#f75801' }}
            >
              <IoChatbubbleEllipses size={22} style={{ color: '#f75801' }} />
              <span className="text-base font-medium" style={{ color: '#f75801' }}>Chat</span>
            </button>

            <button 
              onClick={toggleCamera}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 bg-white hover:opacity-90 transition-opacity"
              style={{ borderColor: '#f75801' }}
            >
              {isVideo ? <IoVideocamOff size={22} style={{ color: '#f75801' }} /> : <IoVideocam size={22} style={{ color: '#f75801' }} />}
              <span className="text-base font-medium" style={{ color: '#f75801' }}>{isVideo ? "Audio" : "Video"}</span>
            </button>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white relative">
            
            {/* REMOTE VIDEO (ALWAYS MOUNTED) */}
            <div
              ref={remoteVideoRef}
              className={`absolute inset-0 bg-black ${isRemoteVideo ? "block" : "hidden"}`}
            />

            {/* LOCAL VIDEO (PiP) */}
            {isVideo && (
              <div
                ref={localVideoRef}
                className="absolute top-4 right-4 w-32 h-40 rounded-xl overflow-hidden bg-black border-2 border-white shadow-lg z-10"
              />
            )}

            {/* PROFILE AREA WITH SPACING - ONLY WHEN NO VIDEO */}
            {!isRemoteVideo && (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                {/* AVATAR WITH ACTIVE RIPPLE EFFECT */}
                <div className="relative mb-12">
                  {/* Active ripple rings */}
                  <div className={styles.rippleRing}></div>
                  <div className={styles.rippleRing}></div>
                  <div className={styles.rippleRing}></div>
                  <div className={styles.rippleRing}></div>
                  
                  {/* Avatar with green border */}
                  <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl bg-white z-10" style={{ border: '12px solid #b7d9a5' }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* CALL TIMER TEXT */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-16">
                  Call Ends in {formatTime(timer)}
                </h3>
              </div>
            )}

            {/* BOTTOM CONTROLS SECTION - FIXED AT BOTTOM */}
            <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 z-20">
              {/* SUGGEST REMEDY BUTTON */}
              <div className="flex justify-center mb-6">
                <button className="px-8 py-3 text-white rounded-full text-base font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}>
                  Suggest Remedy
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </button>
              </div>

              {/* CONTROL BUTTONS */}
              <div className="flex items-center justify-center gap-6">
                
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

                {/* REPORT CALLER BUTTON */}
                <div className="flex flex-col items-center gap-2">
                  <button 
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </button>
                  <span className={`text-sm font-medium ${isRemoteVideo ? 'text-white' : 'text-gray-600'}`}>Report Caller</span>
                </div>

                {/* SPEAKER BUTTON */}
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={() => setSpeakerOn(s => !s)}
                    className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    {speakerOn ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f75801" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.54 8.46a5 5 0 010 7.07"/>
                        <path d="M19.07 4.93a10 10 0 010 14.14"/>
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f75801" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <line x1="23" y1="9" x2="17" y2="15"/>
                        <line x1="17" y1="9" x2="23" y2="15"/>
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm font-medium ${isRemoteVideo ? 'text-white' : 'text-gray-600'}`}>
                    Speaker {speakerOn ? "On" : "Off"}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AgoraVoiceCalling;
