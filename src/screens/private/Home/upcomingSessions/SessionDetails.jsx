import React from "react";
import { Icons } from "../../../../components/Icons";
import { Link } from "react-router";
import { UPCOMING_SESSIONS } from "../../../../components/Dashboard";

const SessionDetails = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 px-4 mb-6">
        <div className="flex items-center gap-4 ">
          <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Link to="/">
              <Icons.ChevronLeft size={20} className="text-gray-700" />
            </Link>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Upcoming Sessions</h1>
        </div>
        <p className="text-red-500">6 in Queue</p>
      </div>

      <div className="space-y-6 pb-24">
        <div>
          <div className="space-y-3">
            {UPCOMING_SESSIONS.map((item) => (
              <div
                key={item.id}
                className="bg-gray-300 rounded-xl p-4 shadow-sm border border-gray-100 relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex font-bold  gap-1">{item.clientName}</div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-800 text-white text-[10px] font-medium px-3 py-1 rounded-full">
                      {item.type}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      {/* <Icons.MoreVertical size={16} /> */}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end text-left">
                  <div>
                    <h4 className="font-bold"></h4>
                    <p className="text-xs  mt-1">
                      Session : {item.duration} minutes
                    </p>
                    <p className="text-xs">
                      Time of Consultation : {item.time}
                    </p>
                  </div>
                  <div className="text-right">
                    {/* <span className="font-bold text-gray-900">
                      ₹{item.price}
                    </span> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      {/* <div className="fixed bottom-6 left-0 w-full px-6 flex justify-center gap-4 z-20 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto shadow-lg bg-gray-900 p-1.5 rounded-full">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium">
            <Icons.Sliders size={16} /> Sort
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-transparent text-white rounded-full text-sm font-medium hover:bg-gray-800">
            <Icons.Filter size={16} /> Filter
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default SessionDetails;
