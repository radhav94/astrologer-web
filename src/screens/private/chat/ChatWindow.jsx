import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Mic, Send } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";
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

/* -------------------- Helpers -------------------- */

const formatDate = (date) => dayjs(date).format("DD MMMM YYYY");
const formatTime = (date) => dayjs(date).format("HH:mm");

/* -------------------- Message Bubble -------------------- */

const Message = ({ text, isSender, time }) => {
  let message = [];
  let isVoiceMsg = false;
  try {
    if (text != null) {
      message = JSON.parse(text);
      isVoiceMsg = true;
    }
  } catch {
    message = text;
    isVoiceMsg = false;
  }

  return (
    <div
      className={`flex w-full mb-4 ${isSender ? "justify-end" : "justify-start"
        }`}
    >
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[65%] ${isSender ? "items-end" : "items-start"
          }`}
      >
        <div
          className={`px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
            ${isSender
              ? "bg-gray-300 text-gray-900 rounded-tr-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-100"
            }
          `}
        >

          {isVoiceMsg == true ? (
            <VoiceMessage
              url={message.audioUrl}
              duration={message.duration}
              sender={isSender}
            />
          ) : (
            text
          )}
        </div>

        <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
          {time}
        </span>
      </div>
    </div>
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

  /* --------- History --------- */
  const { data } = useGetChatHistoryQuery({ userId : userId });
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
    isMessageDisabled
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
  }));

  const socket = socketMessages.map((msg, idx) => ({
    id: `socket-${idx}-${msg.time}`,
    text: msg.text,
    isSender: msg.sender,
    time: msg.time,
    date: msg.date || formatDate(new Date()),
    dateTime: msg.dateTime || new Date().toISOString(),
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const { blob, duration } = await stopRecording();
    const signedUrl = await getS3SignedUrl({
      fileType: blob.type,
    }).unwrap();
    const audioUrl = (signedUrl.uploadUrl).split("?")[0];
    const uploadUrl = signedUrl.uploadUrl;
    await uploadAudioToS3(uploadUrl, blob);
    const jsonString = JSON.stringify({
      type: "voice",
      audioUrl,
      duration,
    });
    astroReply(jsonString);
    setMessage("");
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

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ---------- Header ---------- */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <Link
            to={PATH.privateRoutes.CHAT}
            className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200"
          >
            <ChevronLeft size={20} />
          </Link>

          <Link to="/client-details">
            <h2 className="text-lg font-bold text-gray-900">
              {fullName || ""}
            </h2>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-red-500 bg-red-50 px-3 py-2 rounded-full">
          <IoCallOutline size={20} className="cursor-pointer" />
          <IoVideocamOutline size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* ---------- Messages ---------- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {messagesWithDate.map((msg) =>
          msg.isDate ? (
            <div
              key={msg.id}
              className="text-center text-sm text-gray-500 py-2 my-4 font-medium"
            >
              {msg.date}
            </div>
          ) : (
            <Message key={msg.id} {...msg} />
          )
        )}

        {isTyping && (
          <div className="text-sm text-gray-400 italic mt-2">
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ---------- Input ---------- */}
      {!isMessageDisabled && <div className="sticky bottom-0 z-20 p-4 md:p-6 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            placeholder="Write a message..."
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
            className="flex-1 px-5 py-4 border border-gray-300 rounded-2xl 
           outline-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />

          <button
            onClick={handleSend}
            disabled={!message.trim() || isMessageDisabled}
            aria-label="Send message"
            className={`p-4 rounded-2xl transition-all ${message.trim()
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            <Send size={20} />
          </button>
          <button
            onClick={handleMicClick}
            aria-label="Voice message"
            className="p-4 rounded-2xl transition-all bg-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Mic size={20} />
          </button>
          {recording && (
            <VoiceRecorderPopup
              seconds={seconds}
              onStop={handleStopRecording}
              onCancel={cancelRecording}
            />
          )}
          {/* End button */}
          {/* <button
            className="flex items-center justify-center p-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 active:scale-95 transition"
            onClick={() => setOpenReview(true)}
          >
            End
          </button> */}
        </div>
      </div>}
      {/* Review Modal */}
      {openReview && (
        <ReviewModal
          onClose={() => setOpenReview(false)}
          onSubmit={handleReviewSubmit}
          ratedUserName={fullName}
          reviewerName={userName}
        />
      )}
    </div>
  );
};

export default ChatWindow;
