import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { IoSend, IoAttach, IoClose } from "react-icons/io5";
import styles from "./VideoCallChat.module.scss";
import { useGetChatHistoryQuery } from "../../../redux/activity/chatApi";
import { useGetS3SignedUrlMutation } from "../../../redux/s3SignedApi";
import { useFileSelector } from "../../../screens/private/chat/filePicker/useFileSelector";
import { Toast } from "../../../components";
import dayjs from "dayjs";
import { useVideoCallChat } from "./useVideoCallChat";
import IframeModal from "../../private/chat/IframeModal";
import { GrReactjs } from "react-icons/gr";

const formatDate = (date) => dayjs(date).format("DD MMMM YYYY");

const VideoCallChat = ({
  isOpen,
  onClose,
  videoCallData = {},
  hideAttachment = false,
}) => {
  // const [message, setMessage] = useState("");
  const messagesRef = useRef(null);
  const [iframeSrc, setIframeSrc] = useState(null);

  const { astrologerId, userId, isUserSide, kundliId, chatRoomId, callerName } = videoCallData;

  // Early return if required data is missing
  if (!videoCallData || !userId || !astrologerId || !chatRoomId) {
    console.warn("VideoCallChat: Missing required data", videoCallData);
    return null;
  }

  // Use the custom hook for chat functionality
  const { messages, isTyping, sendMessage: sendChatMessage, sendTyping } = useVideoCallChat({
    userId,
    astrologerId,
    roomId: chatRoomId,
    kundliId,
    isActive: isOpen,
  });

  // Debug log
  useLayoutEffect(() => {
    console.log("VideoCallChat mounted with data:", {
      userId,
      astrologerId,
      chatRoomId,
      kundliId,
      isUserSide,
      isOpen
    });
  }, [userId, astrologerId, chatRoomId, kundliId, isUserSide, isOpen]);

  const [getS3SignedUrl] = useGetS3SignedUrlMutation();
  const { openFileSelector } = useFileSelector();

  // Get chat history
  const { data } = useGetChatHistoryQuery(
    { userId: userId },
    { refetchOnMountOrArgChange: true }
  );
  const history = data?.data || [];

  // Combine history and real-time messages
  const finalMsgs = useMemo(() => {
    const historyMsgs = history.map((item) => ({
      text: item.message || "",
      isSender: isUserSide
        ? item.sender === "user"
        : item.sender === "astrologer",
      time: new Date(item.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      dateTime: item.createdAt,
      type: item?.type,
      kundliId: item?.kundliId,
      kundliName: item?.kundliName,
    }));

    const socketMsgs = messages.map((msg, idx) => ({
      id: `socket-${idx}-${msg.time}`,
      text: msg.text,
      isSender: msg.sender,
      time: msg.time,
      date: msg.date || formatDate(new Date()),
      dateTime: msg.dateTime || new Date().toISOString(),
      type: msg?.type,
      kundliId: msg?.kundliId,
      kundliName: msg?.kundliName,
    }));

    return [...historyMsgs, ...socketMsgs].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
  }, [history, messages, isUserSide]);

  // Auto-scroll to bottom when new messages arrive
  useLayoutEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [finalMsgs]);

  // const handleSend = () => {
  //   console.log("Send button clicked, message:", message);
  //   if (!message.trim()) return;
  //   sendChatMessage(message);
  //   setMessage("");
  // };

  // const handleMessageChange = (e) => {
  //   setMessage(e.target.value);
  //   sendTyping();
  // };

  const sendFiles = async (blob, attachType) => {
    try {
      const signedUrl = await getS3SignedUrl({
        fileType: blob.type,
      }).unwrap();
      const uploadUrl = signedUrl.uploadUrl;
      const fileUrl = uploadUrl.split("?")[0];
      await uploadFileToS3(uploadUrl, blob);
      sendChatMessage(fileUrl, attachType);
      Toast.success("File sent successfully");
    } catch (error) {
      Toast.error("Failed to send file");
      console.error("File upload error:", error);
    }
  };

  const uploadFileToS3 = async (uploadUrl, blob) => {
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

  const getAttachType = (mimeType = "") => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "attachment";
  };


  const handleAttachClick = async () => {
    try {
      const { blob, name, type, size } = await openFileSelector(
        "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
      );
      // console.log("File selected:", { name, type, size });
      const attachType = getAttachType(type);
      await sendFiles(blob, attachType);
    } catch (err) {
      console.log("File selection cancelled or failed:", err);
    }
  };

  const renderMessage = (msg, index) => {
    let isSpecialMessage = false;
    let content = msg.text;
    try {
      if (msg.type === "audio") {
        isSpecialMessage = true;
        content = (
          <div className={styles.voiceMessage}>
            <button className={styles.playButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className={styles.waveformContainer}>
              <audio controls className={styles.audioPlayer}>
                <source src={msg.text} type="audio/mpeg" />
              </audio>
            </div>
            <span className={styles.voiceDuration}>
              {/* {Math.floor(parsed.duration / 60)}:{String(parsed.duration % 60).padStart(2, '0')} */}
            </span>
          </div>
        );
      } else if (msg.type === "video") {
        isSpecialMessage = true;
        content = (
          <div className={styles.videoMessage}>
            <div className={styles.videoWrapper}>
              <video
                className={styles.videoPlayer}
                controls
                preload="metadata"
                onClick={(e) => e.target.play()}
              >
                <source src={msg.text} type="video/mp4" />
                <a
                  href={msg.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  📎 {msg.text}
                </a>
              </video>
            </div>

            <span className={styles.videoDuration}>
              {/* Optional: duration if you calculate later */}
            </span>
          </div>
        );
      } else if (msg.type === "kundli") {
        isSpecialMessage = true;
        content = (
          <div className={styles.KundliMessage}>
            <span
              onClick={() => {
                if (msg.kundliId) setIframeSrc(`${window.location.origin}/kundli/${msg.kundliId}`);
              }}
            >
              <GrReactjs/> {msg.kundliName ? `${msg.kundliName}'s Kundli` : "View Kundli"}
            </span>
          </div>
        );
      } else if (msg.type === "image") {
        isSpecialMessage = true;
        content = (
          <div className={styles.fileMessage}>
            <img
              src={msg.text}
              alt={msg.text}
              className={styles.imageAttachment}
              onClick={() => window.open(msg.text, '_blank')}
            />
          </div>
        )
      } else if (msg.type === "attachment") {
        isSpecialMessage = true;
        let fileUrl = msg.text;
        let displayName = "Download Attachment";
        try {
          const parsed = typeof msg.text === "string" ? JSON.parse(msg.text) : msg.text;
          if (parsed?.url) {
            fileUrl = parsed.url;
            displayName = parsed.fileName || displayName;
          }
        } catch {
          // Not JSON — extract a readable name from URL or raw text
          if (typeof msg.text === "string" && msg.text.startsWith("http")) {
            try {
              const urlPath = new URL(msg.text).pathname;
              const lastSegment = urlPath.split("/").pop();
              if (lastSegment) displayName = decodeURIComponent(lastSegment);
            } catch {
              // keep default
            }
          }
        }
        // Clean up S3-style filenames: remove UUID prefix (e.g. "1776259847338-17dc7de1-...")
        // If name has a recognizable extension, try to shorten
        const extMatch = displayName.match(/\.(pdf|docx?|xlsx?|txt|csv|pptx?|zip|rar)$/i);
        if (!extMatch && displayName.length > 40) {
          // Has MIME-like extension (e.g. .vnd.openxmlformats...), simplify
          if (displayName.includes("wordprocessingml")) displayName = "Document.docx";
          else if (displayName.includes("spreadsheetml")) displayName = "Spreadsheet.xlsx";
          else if (displayName.includes("presentationml")) displayName = "Presentation.pptx";
          else displayName = "Download Attachment";
        }
        content = (
          <div className={styles.fileMessage}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fileLink}
              style={{ wordBreak: "break-all" }}
            >
              📎 {displayName}
            </a>
          </div>
        );
      }
    } catch (e) {
      // Not a JSON message, treat as regular text
    }

    return (
      <>{isSpecialMessage && (<div
        key={index}
        className={`${styles.message} ${msg.isSender ? styles.sent : styles.received
          }`}
      >
        <div className={styles.messageContent}>
          <span>{content}</span>
        </div>
        <div className={styles.messageTime}>{msg.time}</div>
      </div>)}</>

    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>
        <h3>Attachment</h3>
        <button className={styles.closeButton} onClick={onClose}>
          <IoClose size={20} />
        </button>
      </div>

      <div className={styles.messagesContainer} ref={messagesRef}>
        {finalMsgs.map((msg, index) => renderMessage(msg, index))}

        {/* {isTyping && (
          <div className={`${styles.message} ${styles.received}`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {!hideAttachment && (
        <div className={styles.inputContainer}>
          <button
            type="button"
            className={styles.attachButton}
            onClick={handleAttachClick}
            title="Attach file"
          >
            <IoAttach size={18} />
          </button>

        {/* <input
          className={styles.messageInput}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />

        <button 
          className={styles.sendButton} 
          onClick={() => handleSend()}
          disabled={!message.trim()}
        >
          <IoSend size={18} />
        </button> */}
      </div>
      )}
      {/* 👇 Modal */}
      <IframeModal
        open={!!iframeSrc}
        src={iframeSrc}
        onClose={() => setIframeSrc(null)}
      />
    </div>
  );
};

export default VideoCallChat;