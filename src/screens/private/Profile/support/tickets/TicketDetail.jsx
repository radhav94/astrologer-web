import { useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Icons } from "../../../../../components/Icons";
import { useGetTicketDetailQuery, useRateTicketMutation } from "../../../../../redux/supportApi/supportApi";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const { data: apiData, isLoading } = useGetTicketDetailQuery(ticketId);
  const [rateTicket] = useRateTicketMutation();
  const ticket = apiData?.data;
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
            const isUser = msg.sender === "user" || msg.senderType === "user" || msg.from === "user" || msg.senderRole === "ASTROLOGER";
            return (
              <div key={msg._id || idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${isUser ? "bg-[#FFF0E0] text-gray-800 rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"}`}>
                    {msg.text || msg.message || msg.content}
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

      {/* Rating - fixed at bottom */}
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
    </div>
  );
};

export default TicketDetail;
