import { useState, useEffect, useRef, useCallback } from "react";
import { Icons } from "../../../../../components/Icons";
import { Link, useNavigate } from "react-router-dom";
import { useLazyGetMyTicketsQuery } from "../../../../../redux/supportApi/supportApi";

const RecentTickets = () => {
  const [fetchTickets, { isLoading }] = useLazyGetMyTicketsQuery();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const loadTickets = useCallback(async (pageNum) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await fetchTickets({ page: pageNum, limit: 10 }).unwrap();
      const responseData = result?.data;
      const newTickets = Array.isArray(responseData) ? responseData : (responseData?.tickets || responseData?.docs || []);
      setTickets((prev) => pageNum === 1 ? newTickets : [...prev, ...newTickets]);
      setHasMore(newTickets.length >= 10);
    } catch {
      // silently fail
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
    }
  }, [fetchTickets]);

  useEffect(() => {
    loadTickets(1);
  }, [loadTickets]);

  // Infinite scroll observer
  const lastTicketRef = useCallback((node) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadTickets(nextPage);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, page, loadTickets]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" }) +
      " • " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "open" || s === "ongoing" || s === "pending")
      return "bg-[#FDF1DB] text-[#D97706]";
    if (s === "resolved" || s === "closed")
      return "bg-[#E6F4EA] text-[#1E8E3E]";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors">
          <Link to="/profile" state={{ data: "support" }}>
            <Icons.ChevronLeft size={20} className="text-[#F75801]" />
          </Link>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Recent Tickets</h1>
      </div>

      {initialLoading ? (
        <div className="flex justify-center items-center h-32">
          <span className="text-gray-400 text-sm">Loading tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <span className="text-gray-400 text-sm">No tickets found</span>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, idx) => {
            const isLast = idx === tickets.length - 1;
            return (
              <div
                key={ticket._id || idx}
                ref={isLast ? lastTicketRef : null}
                onClick={() => navigate(`/ticket/${ticket._id}`)}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-sm transition-all"
              >
                {/* Top row: ticket number + status */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                  <h3 className="font-bold text-gray-900 text-base">
                    {ticket.ticketId || ticket.ticketNumber || ticket._id?.slice(-4)}
                  </h3>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(ticket.status)}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "currentColor" }} />
                    {ticket.status || "Open"}
                  </span>
                </div>

                <hr className="border-gray-100 mx-5" />

                {/* Date + Topic */}
                <div className="px-5 pt-3 pb-4">
                  <p className="text-xs text-gray-400 mb-2 text-left">{formatDate(ticket.createdAt)}</p>
                  <p className="text-sm font-semibold text-gray-900 text-left">
                    Topic: {ticket.topicName || "—"}
                  </p>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-center py-4">
              <span className="text-gray-400 text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentTickets;
