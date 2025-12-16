import { Icons } from "./Icons";
import { DonutChart, Heatmap } from "./Charts";
import { Link } from "react-router-dom";
import TipsCarousel from "../screens/private/Home/tipsAndGrowth/TipsCarousel";

// --- MOCK DATA ---
export const UPCOMING_SESSIONS = [
  {
    id: "1",
    clientName: "Swati Sharma",
    type: "Call",
    duration: 10,
    time: "10:30 AM",
  },
  {
    id: "2",
    clientName: "Rahul Verma",
    type: "Call",
    duration: 25,
    time: "11:15 AM",
  },
  {
    id: "3",
    clientName: "Priya Singh",
    type: "Call",
    duration: 45,
    time: "02:00 PM",
  },
  {
    id: "4",
    clientName: "Amit Patel",
    type: "Call",
    duration: 15,
    time: "04:30 PM",
  },
];

const METRICS_DATA = [
  { name: "Call", value: 50, fill: "#3b82f6" }, // blue-500
  { name: "Video", value: 30, fill: "#8b5cf6" }, // violet-500
  { name: "Chat", value: 20, fill: "#e2e8f0" }, // slate-200
];

const HEATMAP_DATA = Array.from({ length: 60 }, (_, i) => ({
  day: i + 1,
  value: Math.floor(Math.random() * 5),
}));

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Top Row: Price & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation Price Card */}
        <div className="bg-white rounded-[2rem] p-6 text-left shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="z-10 relative">
            <h3 className="font-bold  text-lg text-gray-900 mb-1">
              Set Your Consultation Price
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[80%]">
              Update your per-minute rate for calls and chats instantly.
            </p>
            <Link
              to="/set-your-consultation-price"
              className="bg-black text-white w-44 px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Set Now <Icons.ArrowRight size={16} />
            </Link>
          </div>
          <div className="absolute top-4 right-4 bg-gray-100 rounded-2xl p-4 w-32 h-32 flex flex-col justify-center items-center">
            <p className="text-xs text-gray-400 mb-1">Current Rate</p>
            <p className="text-2xl font-bold text-gray-900">₹20</p>
            <p className="text-xs text-gray-500">per minute</p>
          </div>
        </div>

        {/* Availability Schedule */}
        <div className="bg-white rounded-[2rem] text-left p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              Set Availability Schedule
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[200px]">
              Curate your weekly, monthly Calendars as per availability
            </p>
            <Link
              to="/profile"
              state={{ data: "availability" }}
              className="bg-black text-white w-44 px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Set Now <Icons.ArrowRight size={16} />
            </Link>
          </div>
          <div className="w-28 h-28 sm:w-32 sm:h-24 bg-gray-200 rounded-2xl">
            <img src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTCs3j72-r-OyO_hvrJcX2L1VtZQdAKkKwF5VW02yHCz5dCGUb2swJrS73BKMzzQ-gzMWiRx-jf" />
          </div>
        </div>
      </div>

      {/* Today's Update Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Update</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ongoing Call Status */}
          <Link to="/call-status">
            <div className="bg-green-100 rounded-[2rem] p-6 flex flex-col justify-between h-56 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icons.Phone size={90} />
              </div>
              <div>
                <p className="text-green-800 text-sm font-medium opacity-60">
                  Current Status
                </p>
              </div>

              <div className="flex items-center justify-center py-4">
                {/* Waveform Animation */}
                <div className="flex items-end gap-1 h-12">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-2 bg-green-600 rounded-full animate-pulse`}
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDuration: `${0.5 + i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-green-900 font-bold">10:36</p>
                <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
                  <Icons.Phone size={14} className="fill-current" />
                  Ongoing Call with
                  <br />
                  #1890 Ms.Swati
                </div>
              </div>
            </div>
          </Link>

          {/* Earnings & Queue */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
            <div className="bg-gray-100 rounded-[2rem] p-6 flex flex-col justify-center h-full min-h-[140px]">
              <p className="text-gray-500 text-sm mb-2">Today's Earnings</p>
              <h3 className="text-4xl font-bold text-gray-900">₹2,000</h3>
            </div>

            <div className="bg-[#EBE4D8] rounded-[2rem] p-6 flex flex-col justify-center h-full min-h-[140px]">
              <p className="text-[#8B7355] text-sm mb-1">Next Session</p>
              <div className="flex items-center gap-2 mb-3 text-[#5D4037] font-semibold">
                <Icons.Menu size={16} />
                <span>4 Clients in Queue</span>
              </div>
              <div className="flex gap-3">
                <span className="bg-[#DBCFB7] text-[#5D4037] px-4 py-2 rounded-xl text-sm font-medium">
                  2 Chat
                </span>
                <span className="bg-[#DBCFB7] text-[#5D4037] px-4 py-2 rounded-xl text-sm font-medium">
                  2 Call
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
          <Link
            to="/upcoming-sessions"
            className="text-sm text-gray-500 hover:text-gray-900 underline"
          >
            View All
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
          {UPCOMING_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="min-w-[160px] bg-white p-4 rounded-2xl shadow-sm snap-start border border-gray-100 flex flex-col gap-3"
            >
              <div className="w-full aspect-square bg-gray-200 rounded-xl overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${session.id}/200`}
                  alt="client"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">
                  {session.clientName}
                </h4>
                <p className="text-xs text-gray-500">{session.type} session</p>
                <p className="text-xs font-medium text-gray-800 mt-1">
                  {session.duration} minutes
                </p>
              </div>
            </div>
          ))}

          {/* Add a ghost card for spacing/padding on mobile scroll */}
          <div className="min-w-[20px]"></div>
        </div>
      </div>

      {/* Monthly Overview & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">
                Monthly Overview
              </h3>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1">
                November <Icons.MoreHorizontal size={14} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-gray-500 text-xs mb-2">
                  Earnings This Month
                </p>
                <h3 className="text-3xl font-bold text-blue-600 mb-2">₹20 K</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                  +3.67% ↑
                </span>
              </div>

              <div className="flex-1 flex items-center gap-4">
                <DonutChart data={METRICS_DATA} />
                <div className="space-y-2">
                  {METRICS_DATA.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-2 h-2 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="text-gray-500 w-8">{item.name}</span>
                      <span className="font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Bubbles */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-4">
              Key Metrics
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex flex-col items-center justify-center text-blue-600 mb-2">
                  <span className="font-bold text-lg">4.5</span>
                  <Icons.Star size={12} fill="currentColor" />
                </div>
                <p className="text-xs font-bold text-gray-800 leading-tight">
                  Average
                  <br />
                  Rating
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex flex-col items-center justify-center text-blue-600 mb-2">
                  <span className="font-bold text-lg">10</span>
                  <span className="text-[10px]">Mins</span>
                </div>
                <p className="text-xs font-bold text-gray-800 leading-tight">
                  Average
                  <br />
                  Response Time
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex flex-col items-center justify-center text-blue-600 mb-2">
                  <span className="font-bold text-lg">10%</span>
                </div>
                <p className="text-xs font-bold text-gray-800 leading-tight">
                  Repeat
                  <br />
                  Sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Heatmap & Milestones */}
        <div className="space-y-6">
          {/* Heatmap */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-4">
              Monthly Sessions
            </h4>
            <Heatmap data={HEATMAP_DATA} />
          </div>

          {/* Milestones */}
          <div className="bg-gray-200 rounded-[2rem] p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Milestones</h3>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/50 rounded-lg">
                <div className="text-yellow-600">⚡</div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  Earn More with Milestones!
                </h4>
                <div className="flex justify-between items-end mt-2 mb-1">
                  <span className="text-[10px] text-gray-500">
                    projected earning for the month
                  </span>
                  <span className="font-bold text-gray-900">₹30,000</span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-gray-300 rounded-full overflow-hidden flex items-center">
                  <div className="h-full bg-gray-600 w-[80%] rounded-full"></div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <p className="text-[10px] text-gray-500 max-w-[200px] leading-tight mt-2">
                    Complete 2 more sessions to start getting ₹30 per minute
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                    <span>🏆</span> 13/15
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips and Growth */}
      <TipsCarousel />
    </div>
  );
};

export default Dashboard;
