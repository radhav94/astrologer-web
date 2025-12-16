import { Link } from "react-router-dom";
import { Icons } from "../../../../components/Icons";

const slots = [
  { id: 1, startTime: "08:00 AM", endTime: "09:00 AM", isOnline: true },
  { id: 2, startTime: "10:00 AM", endTime: "11:00 AM", isOnline: true },
  { id: 3, startTime: "02:00 PM", endTime: "03:00 PM", isOnline: true },
  { id: 4, startTime: "04:00 PM", endTime: "05:00 PM", isOnline: false },
];

const SchedulePage = () => {
  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen md:min-h-0 md:h-auto md:rounded-3xl md:shadow-lg overflow-hidden pb-8">
      {/* Header */}
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

        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
      </header>

      <div className="px-5">
        {/* Add Custom Slot Button */}
        <button className="bg-black text-white text-xs font-medium px-4 py-2.5 rounded-lg flex items-center gap-1 mb-6 shadow-md active:scale-95 transition-transform">
          <span>+</span> Add Custom Slot
        </button>

        {/* Input Form Section */}
        <div className="bg-gray-100/80 rounded-2xl p-5 mb-8">
          <div className="flex gap-4 mb-4">
            {/* Start Time Input */}
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue="01:00 PM"
                  className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* End Time Input */}
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 ml-1">
                End Time
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="--:-- --"
                  className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-500 focus:bg-white transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <button className="bg-black text-white text-sm font-medium px-8 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors">
            Save
          </button>
        </div>

        {/* Slots List */}
        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="bg-gray-200/80 rounded-xl p-4 flex items-center justify-between"
            >
              <span className="text-sm font-bold text-gray-800 tracking-wide">
                {slot.startTime} - {slot.endTime}
              </span>

              {/* Toggle Switch */}
              <button
                className={`
                  relative h-8 w-[84px] rounded-full transition-colors duration-300 flex items-center px-1
                  ${slot.isOnline ? "bg-[#4a8b71]" : "bg-gray-400"}
                `}
              >
                {slot.isOnline && (
                  <span className="absolute left-3 text-[10px] font-medium text-white">
                    Online
                  </span>
                )}
                {!slot.isOnline && (
                  <span className="absolute right-3 text-[10px] font-medium text-white">
                    Offline
                  </span>
                )}
                <div
                  className={`
                    w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300
                    ${slot.isOnline ? "translate-x-[52px]" : "translate-x-0"}
                  `}
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
