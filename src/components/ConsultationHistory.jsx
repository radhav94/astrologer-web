import React from "react";
import { Icons } from "./Icons";
import { Link } from "react-router";

const HISTORY_DATA = [
  {
    id: "1",
    clientName: "Swati Kumar",
    date: "Oct 01, 2025",
    time: "04:36 PM",
    duration: "5 Min 30 Secs",
    price: 200,
    rating: 4,
    type: "Call",
  },
  {
    id: "2",
    clientName: "Nikita Yadav",
    date: "Oct 06, 2025",
    time: "04:15 PM",
    duration: "4 Min 33 Secs",
    price: 220,
    rating: 4.4,
    type: "Call",
  },
  {
    id: "3",
    clientName: "Akshay Khanna",
    date: "Oct 10, 2025",
    time: "03:23 PM",
    duration: "5 Min 11 Secs",
    price: 210,
    rating: 4.2,
    type: "Chat",
  },
  {
    id: "4",
    clientName: "Suresh Gaikwad",
    date: "Oct 19, 2025",
    time: "05:13 PM",
    duration: "6 Min 43 Secs",
    price: 300,
    rating: 4.6,
    type: "Call",
  },
  {
    id: "5",
    clientName: "Ajit Sharma",
    date: "Oct 22, 2025",
    time: "06:06 PM",
    duration: "7 Min 30 Secs",
    price: 320,
    rating: 4.3,
    type: "Call",
  },
  {
    id: "6",
    clientName: "Pawan kulkarni",
    date: "Oct 09, 2025",
    time: "1:54 PM",
    duration: "10 Min 09 Secs",
    price: 500,
    rating: 4.7,
    type: "Call",
  },
];

const ConsultationHistory = ({ onBack }) => {
  return (
    <div className="h-full text-start flex flex-col relative">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Link to="/">
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Consultation History
        </h1>
      </div>

      <div className="space-y-6 pb-24">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            20/11/2025
          </h3>
          <div className="space-y-3">
            {HISTORY_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.Star
                        key={star}
                        size={12}
                        className={
                          star <= item.rating
                            ? "fill-black text-black"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-800 text-white text-[10px] font-medium px-3 py-1 rounded-full">
                      {item.type}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Icons.MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {item.clientName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.date} • {item.time}
                    </p>
                    <p className="text-xs text-gray-500">
                      Duration : {item.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      ₹{item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            20/11/2025
          </h3>
          {/* Repeating data for visual effect as per design */}
          <div className="space-y-3">
            {HISTORY_DATA.slice(0, 2).map((item) => (
              <div
                key={`dup-${item.id}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.Star
                        key={star}
                        size={12}
                        className={
                          star <= item.rating
                            ? "fill-black text-black"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-800 text-white text-[10px] font-medium px-3 py-1 rounded-full">
                      {item.type}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Icons.MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {item.clientName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.date} • {item.time}
                    </p>
                    <p className="text-xs text-gray-500">
                      Duration : {item.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      ₹{item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 left-0 w-full px-6 flex justify-center gap-4 z-20 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto shadow-lg bg-gray-900 p-1.5 rounded-full">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium">
            <Icons.Sliders size={16} /> Sort
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-800">
            <Icons.Filter size={16} /> Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistory;
