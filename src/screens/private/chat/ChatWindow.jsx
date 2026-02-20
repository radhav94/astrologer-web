import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Mic, Send, Gift } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoCallOutline, IoVideocamOutline, IoCallSharp } from "react-icons/io5";
import dayjs from "dayjs";
import { useGetChatHistoryQuery } from "../../../redux/activity/chatApi";
import useChat from "../../../hooks/useChatWindow";
import { PATH } from "../../../utils/routes/Paths";
import VoiceMessage from "./voiceChat/VoiceMessage";
import { useVoiceRecorder } from "./voiceChat/useVoiceRecorder";
import VoiceRecorderPopup from "./voiceChat/VoiceRecorderPopup";
import { useGetS3SignedUrlMutation } from "../../../redux/s3SignedApi";
import ReviewModal from "./review/ReviewModal";
import { useAddUserReviewMutation } from "../../../redux/review/reviewApi";
import { Toast } from "../../../components";
import { GrReactjs } from "react-icons/gr";
import IframeModal from "./IframeModal";
import { voiceSocket } from "../../../services/appServices/voiceSocketServices";
import LinkPreview from "./LinkPreview";
import { detectURL } from "../../../utils/helper/linkPreview";

import CallIcon from "../../../../src/assets/chat/Call.svg"
import VideocamIcon from "../../../../src/assets/chat/Videocam.svg";
import { useChat as useChatContext } from "../../../context/chatContext";
/* -------------------- Helpers -------------------- */

const formatDate = (date) => dayjs(date).format("DD MMMM YYYY");
const formatTime = (date) => dayjs(date).format("hh:mm A");
const MIN_CHAT_SECONDS = 60;

/* -------------------- Message Bubble -------------------- */

const Message = ({ text, isSender, time, type, giftData }) => {
  const [iframeSrc, setIframeSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const userData = JSON.parse(localStorage.getItem("shubhtalk_astrologer_details"));
  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName = firstName && lastName ? `${firstName} ${lastName}` : "Unknown";
  
  const { state } = useLocation();
  const { fullName } = state || {};
  
  let message = text;
  let isVoiceMsg = false;
  // Detect voice message (JSON) only if not a special type
  if (type !== "gift" && type !== "kundli" && type !== "audio" && type !== "video" && type !== "image" && type !== "attachment") {
    try {
      if (typeof text === "string") {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
          message = parsed;
          isVoiceMsg = true;
        }
      }
    } catch {
      message = text;
      isVoiceMsg = false;
    }
  }

  // Extract /kundli/:id path
  const extractKundliPath = (url) => {
    setLoading(true);
    try {
      const parsed = new URL(url);
      return parsed.pathname; // "/kundli/:id"
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Accept only .../kundli/:id
  const kundliUrlRegex = /^https?:\/\/[^\/]+\/kundli\/[^\/\s]+$/i;

  // Normalize message to string for URL scan
  let textToCheck = "";
  if (typeof message === "string") {
    textToCheck = message;
  } else if (Array.isArray(message)) {
    textToCheck = message.join(" ");
  } else if (typeof message === "object" && message !== null) {
    textToCheck = JSON.stringify(message);
  }

  // Extract URLs
  let kundliMatch = null;
  const urlMatches = textToCheck.match(/https?:\/\/[^\s]+/g);

  if (urlMatches) {
    kundliMatch = urlMatches.find((url) => kundliUrlRegex.test(url)) || null;
  }

  // Detect general URLs for link preview (excluding kundli links and voice messages)
  const detectedURL = !isVoiceMsg && !kundliMatch ? detectURL(textToCheck) : null;

  // Handle different message types
  const renderMessageContent = () => {
    // Handle gift type
    if (type === "gift") {
      let parsedGiftData = giftData;
      let giftText = "Gift received";
      
      // If giftData is not passed as prop, try to parse from text
      if (!parsedGiftData && typeof text === "string") {
        try {
          const parsed = JSON.parse(text);
          if (parsed.giftData) {
            parsedGiftData = parsed.giftData;
            giftText = parsed.text || giftText;
          }
        } catch (e) {
          // If parsing fails, giftData might be passed directly
          parsedGiftData = giftData;
        }
      } else if (parsedGiftData) {
        giftText = parsedGiftData.text || giftText;
      }

      const parts = giftText.split("a gift");

      return (
        <div className="flex flex-col gap-3 min-w-[250px] animate-fadeIn">
          {/* Gift Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Gift size={18} className="animate-bounce" style={{ color: '#f75801' }} />
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Gift Received
            </span>
          </div>
          {/* Gift Message */}
          {giftText && (
            <p className="text-sm text-gray-700 italic bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border-l-4" style={{ borderLeftColor: '#f75801' }}>
              "{parts[0]} a gift to you"
            </p>
          )}
          {/* Gift Content */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={parsedGiftData?.giftImg}
                alt={parsedGiftData?.giftName}
                className="w-20 h-20 object-contain rounded-lg bg-white p-2 shadow-sm border border-gray-100"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="flex flex-col flex-1">
              <span className="font-bold text-lg text-gray-900">
                {parsedGiftData?.giftName}
              </span>
              <span className="text-base font-semibold" style={{ color: '#f75801' }}>
                ₹{parsedGiftData?.price?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Handle type-based messages
    if (type === "audio") {
      return (
        <VoiceMessage
          url={text}
          sender={isSender}
        />
      );
    }

    if (type === "image") {
      return (
        <img
          src={text}
          alt="Shared image"
          className="max-w-[200px] max-h-[200px] object-cover rounded-lg"
        />
      );
    }

    if (type === "video") {
      return (
        <video
          src={text}
          controls
          className="max-w-[250px] max-h-[250px] rounded-lg"
        />
      );
    }

    if (type === "attachment") {
      return (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm underline font-semibold"
        >
          <span className="text-lg">📎</span>
          <span className="truncate max-w-[180px]">Download Attachment</span>
        </a>
      );
    }

    if (type === "kundli") {
      return (
        <div
          onClick={() => {
            const path = extractKundliPath(text);
            if (path) setIframeSrc(path);
          }}
          style={{
            textDecoration: "underline",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <GrReactjs />
          View Kundli
        </div>
      );
    }

    // Handle kundli match from URL detection
    if (kundliMatch) {
      return (
        <div
          onClick={() => {
            const path = extractKundliPath(kundliMatch);
            if (path) setIframeSrc(path);
          }}
          style={{
            textDecoration: "underline",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <GrReactjs />
          View Kundli
        </div>
      );
    }

    // Handle voice message from JSON
    if (isVoiceMsg) {
      return (
        <VoiceMessage
          url={message.audioUrl}
          duration={message.duration}
          sender={isSender}
        />
      );
    }

    // Handle regular text with link preview
    return (
      <>
        {/* Show the text if it's more than just the URL */}
        {detectedURL && text !== detectedURL ? (
          <div style={{ marginBottom: 8 }}>
            {text}
          </div>
        ) : !detectedURL ? (
          text
        ) : null}
        
        {/* Show link preview if URL detected */}
        {detectedURL && (
          <LinkPreview url={detectedURL} isSender={isSender} />
        )}
      </>
    );
  };

  return (
    <>
      <div className={`flex items-start gap-2 mb-3 ${isSender ? "justify-end" : "justify-start"}`}>
        {/* Receiver Avatar - Left side */}
        {!isSender && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}>
            {fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
        )}

        <div className={`flex flex-col max-w-[70%] ${isSender ? "items-end" : "items-start"}`}>
          <div
            className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
              isSender
                ? "bg-[#FFE4BA] text-gray-900 rounded-tr-md"
                : "bg-white text-gray-800 rounded-tl-md border border-gray-100"
            }`}
          >
            {renderMessageContent()}
          </div>

          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-[11px] text-gray-400 font-medium">
              {time}
            </span>
            {isSender && (
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-gray-400">
                <path d="M1 4L4 7L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 4L10 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Sender Avatar - Right side */}
        {isSender && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {userName?.charAt(0)?.toUpperCase() || "Y"}
          </div>
        )}
      </div>

      <IframeModal
        open={!!iframeSrc}
        src={iframeSrc}
        onClose={() => setIframeSrc(null)}
        loading={loading}
      />
    </>
  );
};


const ChatWindow = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );
  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName =
    firstName && lastName ? `${firstName} ${lastName}` : "Unknown";
  const {
    userId,
    astrologerId,
    roomId,
    fullName,
    isUserSide,
    kundliId,
    userID
  } = state || {};

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  /* --------- History --------- */
  const { data } = useGetChatHistoryQuery({ userId: userId }, { refetchOnMountOrArgChange: roomId ? true : false });
  const historyMessages = data?.data || [];

  // Review
  const [openReview, setOpenReview] = useState(false);
  const [addUserReview, { isLoading }] = useAddUserReviewMutation();

  /* --------- Socket Chat --------- */
  const {
    messages: socketMessages,
    isTyping,
    astroReply,
    sendTyping,
    isMessageDisabled,
    formattedTime,
    chatSeconds,
    remainingTime,
    handleChatEndedFromServer
  } = useChat({
    userId,
    astrologerId,
    roomId,
    isUserSide,
    kundliId,
    setOpenReview
  });

  /* --------- Normalize & Merge Messages --------- */
  const finalMessages = useMemo(() => {
    const history = historyMessages.map((item, index) => ({
      id: `history-${item._id || item.createdAt}-${index}`,
      text: item.message,
      isSender: isUserSide
        ? item.sender === "user"
        : item.sender === "astrologer",
      time: formatTime(item.createdAt),
      date: formatDate(item.createdAt),
      dateTime: item.createdAt,
      type: item?.type
    }));

    const socket = socketMessages.map((msg, idx) => ({
      id: `socket-${idx}-${msg.time}`,
      text: msg.text,
      isSender: msg.sender,
      time: msg.time,
      date: msg.date || formatDate(new Date()),
      dateTime: msg.dateTime || new Date().toISOString(),
      type: msg?.type
    }));

    return [...history, ...socket].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
  }, [historyMessages, socketMessages, isUserSide]);

  /* --------- Group By Date --------- */
  const messagesWithDate = useMemo(() => {
    const grouped = [];

    finalMessages.forEach((msg, index) => {
      const prev = finalMessages[index - 1];

      if (!prev || prev.date !== msg.date) {
        grouped.push({
          id: `date-${msg.date}`,
          isDate: true,
          date: msg.date,
        });
      }

      grouped.push(msg);
    });

    return grouped;
  }, [finalMessages]);

  /* --------- Auto Scroll --------- */
  useEffect(() => {
    // Scroll to bottom using scrollTop
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messagesWithDate]);

  /* --------- Send Message --------- */
  const handleSend = () => {
    if (!message.trim()) return;

    astroReply(message.trim());
    setMessage("");
  };

  const {
    recording,
    seconds,
    startRecording,
    stopRecording,
    cancelRecording
  } = useVoiceRecorder();

  const handleMicClick = async () => {
    await startRecording();
  };

  const [getS3SignedUrl] = useGetS3SignedUrlMutation();
  const handleStopRecording = async () => {
    const { blob } = await stopRecording();
    const signedUrl = await getS3SignedUrl({
      fileType: blob.type,
    }).unwrap();
    const audioUrl = (signedUrl.uploadUrl).split("?")[0];
    const uploadUrl = signedUrl.uploadUrl;
    await uploadAudioToS3(uploadUrl, blob);
    const attachType = getAttachType(blob.type);
    astroReply(audioUrl, attachType);
    setMessage("");
  };

  const getAttachType = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else {
      return 'attachment';
    }
  };

  const uploadAudioToS3 = async (uploadUrl, blob) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": blob.type,
      },
    });

    if (!res.ok) {
      throw new Error("S3 upload failed");
    }

    return "success";
  };

  const handleDisconnect = () => {
    try {
      voiceSocket.emit("chat:end", { roomId, endedBy: "ASTROLOGER" });
    } catch (error) {
      handleChatEndedFromServer();
      console.log('chat end error', error);
    }
  };

  const handleChatEnd = () => {
    if (remainingTime * 60 - chatSeconds < MIN_CHAT_SECONDS) {
      Toast.error("Chat cannot be ended before 1 minute");
      return false;
    }
    handleDisconnect();
    return true;
  };

  // if (!state?.roomId) {
  //   return (
  //     <div className="h-screen flex items-center justify-center text-gray-500">
  //       Unable to open chat. Please go back and select a conversation.
  //     </div>
  //   );
  // }

  const handleReviewSubmit = async ({ rating, review, isAnonymous }) => {
    try {
      const res = await addUserReview({
        userID,
        rating,
        review,
        isAnonymous,
      }).unwrap();

      if (res.success) {
        Toast.success(res.message);
        navigate(-1)
      } else {
        Toast.error(res.message);
      }

      setOpenReview(false);
    } catch (error) {
      console.error("Failed to submit review", error);
    }
  }

  /* -------------------- UI -------------------- */

  const { activeChat } = useChatContext();
  const isChatActive = activeChat && activeChat?.roomId;
  return (
    <div className="-m-4 max-w-none flex flex-col h-screen bg-gray-50">
      {/* ---------- Header ---------- */}
      <div className="sticky top-20 z-20 bg-white">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ borderColor: '#f75801' }}
            >
              <ChevronLeft size={20} style={{ color: '#f75801' }} />
            </button>

            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #f75801, #d43400)' }}>
              {fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-gray-900">
                {fullName || "User"}
              </h2>
              <span className="text-xs text-gray-500">Exp. 1 year</span>
            </div>
          </div>

          {/* Desktop View - Call/Video icons, Timer, End button */}
          <div className="hidden md:flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg border flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{ 
                borderColor: '#f75801'
              }}
            >
              <img src={CallIcon} alt="Voice Call" width="20" height="20" />
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            <button className="w-10 h-10 rounded-lg border flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{ 
                borderColor: '#f75801'
              }}
            >
              <img src={VideocamIcon} alt="Video Call" width="20" height="20" />
            </button>

            {isChatActive && (
              <>
                <span className="text-sm font-medium text-gray-700 ml-2">
                  Chat Ends in <span className="text-red-500 font-semibold">{formattedTime}</span>
                </span>

                <button
                  onClick={handleChatEnd}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <g clipPath="url(#clip0_8955_984)">
                      <path d="M7.12004 8.87333C7.79661 9.5505 8.56125 10.1335 9.39337 10.6067L10.24 9.76C10.4213 9.58076 10.6501 9.45723 10.8994 9.40406C11.1488 9.35089 11.4081 9.3703 11.6467 9.46C12.2516 9.6857 12.88 9.84225 13.52 9.92667C13.8404 9.97195 14.1334 10.1322 14.3443 10.3775C14.5553 10.6228 14.6699 10.9365 14.6667 11.26V13.26C14.6675 13.4457 14.6294 13.6294 14.555 13.7996C14.4807 13.9697 14.3716 14.1224 14.2348 14.2479C14.0979 14.3734 13.9364 14.469 13.7605 14.5285C13.5847 14.588 13.3983 14.61 13.2134 14.5933C11.1619 14.3704 9.19137 13.6694 7.46004 12.5467C6.65688 12.0367 5.91239 11.4398 5.24004 10.7667M3.46004 8.54C2.33727 6.80867 1.63628 4.83811 1.41337 2.78667C1.39671 2.60231 1.41862 2.41651 1.4777 2.24108C1.53679 2.06566 1.63175 1.90446 1.75655 1.76775C1.88134 1.63103 2.03324 1.5218 2.20256 1.44701C2.37189 1.37222 2.55493 1.33351 2.74004 1.33333H4.74004C5.06357 1.33015 5.37723 1.44472 5.62254 1.65569C5.86786 1.86666 6.02809 2.15963 6.07337 2.48C6.15779 3.12004 6.31434 3.74848 6.54004 4.35333C6.62973 4.59195 6.64915 4.85127 6.59597 5.10059C6.5428 5.3499 6.41928 5.57874 6.24004 5.76L5.39337 6.60667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14.6666 1.33333L1.33325 14.6667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                      <clipPath id="clip0_8955_984">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  End
                </button>
              </>
            )}
          </div>

          {/* Mobile View - Timer and End button */}
          {isChatActive && (
            <div className="md:hidden flex items-center gap-3">
              <span className="text-sm font-semibold text-red-500">{formattedTime}</span>
              
              <button
                onClick={handleChatEnd}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_8955_984_mobile)">
                    <path d="M7.12004 8.87333C7.79661 9.5505 8.56125 10.1335 9.39337 10.6067L10.24 9.76C10.4213 9.58076 10.6501 9.45723 10.8994 9.40406C11.1488 9.35089 11.4081 9.3703 11.6467 9.46C12.2516 9.6857 12.88 9.84225 13.52 9.92667C13.8404 9.97195 14.1334 10.1322 14.3443 10.3775C14.5553 10.6228 14.6699 10.9365 14.6667 11.26V13.26C14.6675 13.4457 14.6294 13.6294 14.555 13.7996C14.4807 13.9697 14.3716 14.1224 14.2348 14.2479C14.0979 14.3734 13.9364 14.469 13.7605 14.5285C13.5847 14.588 13.3983 14.61 13.2134 14.5933C11.1619 14.3704 9.19137 13.6694 7.46004 12.5467C6.65688 12.0367 5.91239 11.4398 5.24004 10.7667M3.46004 8.54C2.33727 6.80867 1.63628 4.83811 1.41337 2.78667C1.39671 2.60231 1.41862 2.41651 1.4777 2.24108C1.53679 2.06566 1.63175 1.90446 1.75655 1.76775C1.88134 1.63103 2.03324 1.5218 2.20256 1.44701C2.37189 1.37222 2.55493 1.33351 2.74004 1.33333H4.74004C5.06357 1.33015 5.37723 1.44472 5.62254 1.65569C5.86786 1.86666 6.02809 2.15963 6.07337 2.48C6.15779 3.12004 6.31434 3.74848 6.54004 4.35333C6.62973 4.59195 6.64915 4.85127 6.59597 5.10059C6.5428 5.3499 6.41928 5.57874 6.24004 5.76L5.39337 6.60667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.6666 1.33333L1.33325 14.6667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_8955_984_mobile">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                End
              </button>
            </div>
          )}
        </div>

        {/* Mobile Call Buttons - Part of sticky header */}
        <div className="md:hidden flex gap-3 px-4 py-3 bg-[#FFF8F0] border-b border-gray-200">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 bg-white hover:opacity-90 transition-opacity"
            style={{ borderColor: '#f75801' }}
          >
            <img src={CallIcon} alt="Voice Call" width="20" height="20" />
            <span className="text-base font-medium" style={{ color: '#f75801' }}>Voice Call</span>
          </button>

          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 bg-white hover:opacity-90 transition-opacity"
            style={{ borderColor: '#f75801' }}
          >
            <img src={VideocamIcon} alt="Video Call" width="20" height="20" />
            <span className="text-base font-medium" style={{ color: '#f75801' }}>Video Call</span>
          </button>
        </div>
      </div>

      {/* ---------- Messages ---------- */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-8 custom-scrollbar">
        {messagesWithDate.map((msg) =>
          msg.isDate ? (
            <div
              key={msg.id}
              className="text-center text-sm text-gray-500 py-2 my-4 font-medium"
            >
              {msg.date}
            </div>
          ) : (
            <Message key={msg.id} text={msg.text} isSender={msg.isSender} time={msg.time} type={msg.type} />
          )
        )}

        {isTyping && (
          <div className="text-sm text-gray-400 italic mt-2">
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* ---------- Input ---------- */}
      {!isMessageDisabled && (
        <div className="sticky bottom-0 z-20 px-4 py-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg px-5 py-3.5 shadow-sm">
              <input
                type="text"
                value={message}
                placeholder="Type your message here..."
                onChange={(e) => {
                  setMessage(e.target.value);
                  sendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isMessageDisabled}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
              />

              <div className="flex items-center gap-3 ml-3 border-l border-gray-300 pl-3">
                {/* <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button> */}

                <button
                  onClick={handleMicClick}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: '#f75801' }}
                >
                  <Mic size={24} />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isMessageDisabled}
                  className="hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: '#f75801' }}
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>

          {recording && (
            <VoiceRecorderPopup
              seconds={seconds}
              onStop={handleStopRecording}
              onCancel={cancelRecording}
            />
          )}
        </div>
      )}
      {/* Review Modal */}
      {openReview && (
        <ReviewModal
          onClose={() => setOpenReview(false)}
          onSubmit={handleReviewSubmit}
          ratedUserName={fullName}
          reviewerName={userName}
        />
      )}
      {/* 👇 Modal */}
    </div>
  );
};

export default ChatWindow;