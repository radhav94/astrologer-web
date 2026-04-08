import { useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Icons } from "../../../../../components/Icons";
import { useGetTicketDetailQuery, useSendTicketMessageMutation, useRateTicketMutation } from "../../../../../redux/supportApi/supportApi";
import { useGetS3SignedUrlMutation } from "../../../../../redux/s3SignedApi";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const { data: apiData, isLoading, refetch } = useGetTicketDetailQuery(ticketId);
  const [sendMessage, { isLoading: isSending }] = useSendTicketMessageMutation();
  const [rateTicket] = useRateTicketMutation();
  const [getS3SignedUrl] = useGetS3SignedUrlMutation();
  const ticket = apiData?.data;
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const messages = ticket?.messages || ticket?.conversation || [];
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (ticket?.rating) {
      setSelectedRating(ticket.rating);
      setRatingSubmitted(true);
    }
  }, [ticket?.rating]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "open" || s === "ongoing" || s === "pending") return "bg-[#FDF1DB] text-[#D97706]";
    if (s === "resolved" || s === "closed") return "bg-[#E6F4EA] text-[#1E8E3E]";
    return "bg-gray-100 text-gray-600";
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><span className="text-gray-400 text-sm">Loading...</span></div>;
  if (!ticket) return <div className="h-full flex items-center justify-center"><span className="text-gray-400 text-sm">Ticket not found</span></div>;

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors">
            <Link to="/recent-tickets"><Icons.ChevronLeft size={20} className="text-[#F75801]" /></Link>
          </button>
          <h1 className="text-lg font-bold text-gray-900">{ticket.ticketId || ticket.ticketNumber || ticketId?.slice(-4)}</h1>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(ticket.status)}`}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "currentColor" }} />
          {ticket.status || "Open"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          ticket.issue && (
            <div className="flex justify-start">
              <div className="max-w-[80%] flex flex-col items-start">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white text-gray-800 text-sm border border-gray-100 shadow-sm">{ticket.issue}</div>
                <span className="text-[10px] text-gray-400 mt-1">{formatTime(ticket.createdAt)}</span>
              </div>
            </div>
          )
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.isUserMessage === true;
            let text = msg.messageText || msg.message || msg.text || msg.content || "";
            // Render initialMessage as a styled card
            if (msg.initialMessage) {
              const init = msg.initialMessage;
              return (
                <div key={msg._id || idx} className="flex justify-end">
                  <div className="max-w-[85%] flex flex-col items-end">
                    <div className="rounded-2xl rounded-tr-sm shadow-sm overflow-hidden w-full border border-[#F7C9A0]">
                      {/* Topic Header */}
                      <div className="flex items-center gap-3 px-5 py-4 bg-[#FDECD4]">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F75801" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 text-base">{init.topic}</h4>
                      </div>

                      {/* Entity + Issue Section */}
                      <div className="bg-[#FFF5E6] px-5 py-4">
                        {/* Entity Card */}
                        {init.entityDetails && (
                          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 mb-3 shadow-sm">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-[3px] border-[#F7C9A0]">
                              {init.entityDetails.profileImgUrl ? (
                                <img src={init.entityDetails.profileImgUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-orange-50 flex items-center justify-center text-[#F75801] font-bold text-xl">
                                  {(init.entityDetails.name || "U").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-base truncate">{init.entityDetails.name}</p>
                              <p className="text-sm text-gray-400 capitalize">{init.entityDetails.role || "User"}</p>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                          </div>
                        )}

                        {/* Issue Text */}
                        {init.issue && (
                          <div className="flex items-center gap-3">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#b0b0b0"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
                            <span className="text-sm text-gray-700">{init.issue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">{formatTime(msg.createdAt)} ✓✓</span>
                  </div>
                </div>
              );
            }
            if (!text) return null;
            return (
              <div key={msg._id || idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${isUser ? "bg-[#FFF0E0] text-gray-800 rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"}`}>
                    {text}
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {msg.attachments.map((att) => {
                          const isImage = att.fileType === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.url || att.fileName || "");
                          return (
                            <a
                              key={att._id}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {isImage ? (
                                <img src={att.url} alt={att.fileName || "attachment"} className="max-w-full rounded-lg max-h-48 object-cover" />
                              ) : (
                                <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#F75801"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                                  <span className="text-xs text-gray-700 truncate">{att.fileName || "File"}</span>
                                </div>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    {formatTime(msg.createdAt || msg.timestamp)}
                    {isUser && <span>✓✓</span>}
                  </span>
                </div>
              </div>
            );
          })
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Rating - fixed at bottom (only for resolved/closed) */}
      {(ticket.status?.toLowerCase() === "resolved" || ticket.status?.toLowerCase() === "closed") ? (
        <div className="flex justify-center py-4 bg-white border-t border-gray-100">
          <div className="bg-[#E8E8E8] rounded-xl p-4 flex flex-col items-center gap-3 w-[90%] max-w-sm">
            <div className="bg-white rounded-xl px-6 py-4 flex gap-2 w-full justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={async () => {
                    if (ratingSubmitted) return;
                    setSelectedRating(star);
                    try {
                      await rateTicket({ ticketId, rating: star }).unwrap();
                      setRatingSubmitted(true);
                    } catch {
                      // keep the selection, user can retry
                    }
                  }}
                  disabled={ratingSubmitted}
                  className="transition-transform hover:scale-110 disabled:cursor-default"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= selectedRating ? "#F75801" : "#F4C2A3"} stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-gray-900">
              {ratingSubmitted ? "Thank you for your feedback!" : "Please Rate your Experience"}
            </p>
          </div>
        </div>
      ) : (
        /* Chat input - for open/pending tickets */
        <div className="border-t border-gray-100 bg-white p-3">
          {/* Attachment preview */}
          {attachment && (
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#F75801"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                <span className="truncate max-w-[200px]">{attachment.fileName}</span>
                <button onClick={() => setAttachment(null)} className="text-red-400 hover:text-red-600 ml-1">✕</button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* Attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#F75801] hover:bg-orange-50 transition-colors flex-shrink-0 disabled:opacity-40"
            >
              {isUploading ? (
                <span className="text-xs">...</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                try {
                  const signedUrl = await getS3SignedUrl({ fileType: file.type }).unwrap();
                  const uploadUrl = signedUrl.uploadUrl;
                  const fileUrl = uploadUrl.split("?")[0];
                  await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                  setAttachment({ url: fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size });
                } catch { /* silently fail */ }
                setIsUploading(false);
                e.target.value = "";
              }}
            />
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (inputText.trim() || attachment) && !isSending) {
                    const text = inputText.trim();
                    const att = attachment;
                    setInputText("");
                    setAttachment(null);
                    const body = { ticketId, message: text || " " };
                    if (att) body.attachments = [{ url: att.url, fileName: att.fileName, fileType: att.fileType, fileSize: att.fileSize }];
                    sendMessage(body).unwrap().then(() => refetch());
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={() => {
                  if ((!inputText.trim() && !attachment) || isSending) return;
                  const text = inputText.trim();
                  const att = attachment;
                  setInputText("");
                  setAttachment(null);
                  const body = { ticketId, message: text || " " };
                  if (att) body.attachments = [{ url: att.url, fileName: att.fileName, fileType: att.fileType, fileSize: att.fileSize }];
                  sendMessage(body).unwrap().then(() => refetch());
                }}
                disabled={(!inputText.trim() && !attachment) || isSending}
                className="text-[#F75801] hover:opacity-80 disabled:opacity-40 ml-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
