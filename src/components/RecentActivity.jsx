import React from "react";
import { Icons } from "./Icons";
import { Link } from "react-router";

const ACTIVITY_DATA = [
  {
    id: "1",
    type: "follow",
    title: "Swati Kumar started",
    subtitle: "following you",
    timeAgo: "2h ago",
  },
  {
    id: "2",
    type: "consultation",
    title: "Consultation ended",
    subtitle: "with Parvati",
    timeAgo: "2h ago",
    amount: 200,
    consultationType: "Call",
  },
  {
    id: "3",
    type: "consultation",
    title: "Consultation ended",
    subtitle: "with Sunny Singh",
    timeAgo: "2h ago",
    amount: 200,
    consultationType: "Call",
  },
  {
    id: "4",
    type: "consultation",
    title: "Consultation ended",
    subtitle: "with Sunny Singh",
    timeAgo: "2h ago",
    amount: 200,
    consultationType: "Call",
  },
  {
    id: "5",
    type: "follow",
    title: "Swati Kumar started",
    subtitle: "following you",
    timeAgo: "2h ago",
  },
  {
    id: "6",
    type: "follow",
    title: "Swati Kumar started",
    subtitle: "following you",
    timeAgo: "2h ago",
  },
];

const RecentActivity = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col text-start ">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Link to="/">
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Recent Activity</h1>
      </div>

      <div className="space-y-6 pb-20">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            20/11/2025
          </h3>
          <div className="space-y-3">
            {ACTIVITY_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-[#EAEAEA] rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12  flex-shrink-0">
                    <img
                      className="rounded-full"
                      src={`https://picsum.photos/seed/${item.id}/200`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {item.title} <br />
                      <span className="text-gray-600">{item.subtitle}</span>
                    </p>
                    {item.consultationType && (
                      <span className="inline-block mt-1 px-2 py-0.5 border border-gray-500 rounded-full text-[10px] text-gray-600 font-medium">
                        {item.consultationType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right h-full flex flex-col justify-between self-stretch py-1">
                  <p className="text-xs text-gray-400">{item.timeAgo}</p>
                  {item.amount && (
                    <p className="text-green-600 font-bold text-sm">
                      + ₹{item.amount}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duplicate section for demo scrolling */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            20/11/2025
          </h3>
          <div className="space-y-3">
            {ACTIVITY_DATA.slice(0, 3).map((item) => (
              <div
                key={`dup-${item.id}`}
                className="bg-[#EAEAEA] rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12  flex-shrink-0">
                    <img
                      className="rounded-full"
                      src={`https://picsum.photos/seed/${item.id}/200`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {item.title} <br />
                      <span className="text-gray-600">{item.subtitle}</span>
                    </p>
                    {item.consultationType && (
                      <span className="inline-block mt-1 px-2 py-0.5 border border-gray-500 rounded-full text-[10px] text-gray-600 font-medium">
                        {item.consultationType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right h-full flex flex-col justify-between self-stretch py-1">
                  <p className="text-xs text-gray-400">{item.timeAgo}</p>
                  {item.amount && (
                    <p className="text-green-600 font-bold text-sm">
                      + ₹{item.amount}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
