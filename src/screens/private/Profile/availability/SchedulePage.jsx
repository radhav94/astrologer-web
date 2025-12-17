import { Link } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import { useState } from "react";

const initialSlots = [
  { id: 1, startTime: "08:00 AM", endTime: "09:00 AM", isOnline: true },
  { id: 2, startTime: "10:00 AM", endTime: "11:00 AM", isOnline: true },
  { id: 3, startTime: "02:00 PM", endTime: "03:00 PM", isOnline: true },
  { id: 4, startTime: "04:00 PM", endTime: "05:00 PM", isOnline: false },
];

const SchedulePage = () => {
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("");
  const [slots, setSlots] = useState(initialSlots);

  const handleToggle = (id) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, isOnline: !slot.isOnline } : slot
      )
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen md:min-h-0 md:h-auto md:rounded-3xl md:shadow-lg overflow-hidden pb-8">
      <header className="flex items-center justify-between px-6 py-6 bg-white">
        <div className="flex items-center gap-4 mb-8">
          <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Link to="/profile" state={{ data: "availability" }}>
              <Icons.ChevronLeft size={20} className="text-gray-700" />
            </Link>
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <span className="bg-gray-200 px-3 py-1.5 rounded-md text-gray-700">
            8 Dec'25
          </span>
          <span className="text-gray-400 text-xs">to</span>
          <span className="bg-gray-200 px-3 py-1.5 rounded-md text-gray-700">
            24 Dec'25
          </span>
        </div>
      </header>

      <div className="px-5">
        <button className="bg-black text-white text-xs font-medium px-4 py-2.5 rounded-lg flex items-center gap-1 mb-6 shadow-md active:scale-95 transition-transform">
          <span>+</span> Add Custom Slot
        </button>

        <div className="bg-gray-100/80 rounded-2xl p-5 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <button className="bg-black text-white text-sm font-medium px-8 py-2 rounded-full">
            Save
          </button>
        </div>

        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="bg-gray-200/80 rounded-xl p-4 flex items-center justify-between"
            >
              <span className="text-sm font-bold text-gray-800">
                {slot.startTime} - {slot.endTime}
              </span>

              <button
                onClick={() => handleToggle(slot.id)}
                className={`relative h-8 w-[84px] rounded-full flex items-center px-1 transition-colors duration-300
                  ${slot.isOnline ? "bg-[#4a8b71]" : "bg-gray-400"}`}
              >
                <span
                  className={`absolute text-[10px] font-medium text-white
                  ${slot.isOnline ? "left-3" : "right-3"}`}
                >
                  {slot.isOnline ? "Online" : "Offline"}
                </span>

                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300
                    ${slot.isOnline ? "translate-x-[52px]" : "translate-x-0"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
