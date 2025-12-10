import React from "react";
import { Icons } from "../../../../../components/Icons";
import { Link } from "react-router-dom";

const TICKETS = [
  {
    id: "#1896",
    date: "Oct 01, 2025 • 04:36 PM",
    topic: "Booking and Consultation",
    status: "Ongoing",
  },
  {
    id: "#1897",
    date: "Oct 01, 2025 • 04:36 PM",
    topic: "Booking and Consultation",
    status: "Resolved",
  },
  {
    id: "#1898",
    date: "Oct 01, 2025 • 04:36 PM",
    topic: "Booking and Consultation",
    status: "Resolved",
  },
  {
    id: "#1899",
    date: "Oct 01, 2025 • 04:36 PM",
    topic: "Booking and Consultation",
    status: "Resolved",
  },
  {
    id: "#1900",
    date: "Oct 01, 2025 • 04:36 PM",
    topic: "Booking and Consultation",
    status: "Resolved",
  },
];

const RecentTickets = () => {
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Link to="/profile" state={{ data: "support" }}>
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Recent Tickets</h1>
      </div>

      <div className="space-y-4">
        {TICKETS.map((ticket, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-gray-900 text-lg">{ticket.id}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    ticket.status === "Ongoing"
                      ? "bg-[#FDF1DB] text-[#D97706]"
                      : "bg-[#E6F4EA] text-[#1E8E3E]"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{ticket.date}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Topic:
                </span>
                <span className="text-sm text-gray-900">{ticket.topic}</span>
              </div>
            </div>

            {/* <button className="self-start md:self-center px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
              View Details
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTickets;
