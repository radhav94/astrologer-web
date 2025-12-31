import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Send } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import dayjs from "dayjs";
import { useGetChatHistoryQuery } from "../../../redux/activity/chatApi";
import useChat from "../../../hooks/useChatWindow";
import { PATH } from "../../../utils/routes/Paths";


/* -------------------- Helpers -------------------- */

const formatDate = (date) => dayjs(date).format("DD MMMM YYYY");
const formatTime = (date) => dayjs(date).format("HH:mm");

/* -------------------- Message Bubble -------------------- */

const Message = ({ text, isSender, time }) => {
  return (
    <div
      className={`flex w-full mb-4 ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[65%] ${
          isSender ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
            ${
              isSender
                ? "bg-gray-300 text-gray-900 rounded-tr-sm"
                : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-100"
            }
          `}
        >
          {text}
        </div>

        <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
          {time}
        </span>
      </div>
    </div>
  );
};


const ChatWindow = () => {
  const { state } = useLocation();
  const {
    userId,
    astrologerId,
    roomId,
    fullName,
    isUserSide,
    kundliId,
  } = state || {};

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  /* --------- History --------- */
  const { data } = useGetChatHistoryQuery({ userId : userId });
  const historyMessages = data?.data || [];

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

  if (!state?.roomId) {
    return (
        <div className="h-screen flex items-center justify-center text-gray-500">
        Unable to open chat. Please go back and select a conversation.
        </div>
    );
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
      <div className="sticky bottom-0 z-20 p-4 md:p-6 border-t border-gray-100 bg-white">
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
            className={`p-4 rounded-2xl transition-all ${
              message.trim()
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
