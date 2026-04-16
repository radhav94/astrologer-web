import { Icons } from "../Icons";
import { appSvgs } from "../../utils/appImages";

const ActiveSessionCard = ({ sessionData, onClick }) => {
  const { userName = "Customer", sessionId = "", time = "--:--", sessionType = "Call", type = "audio" } = sessionData || {};

  return (
    <div
      onClick={onClick}
      className="relative bg-gradient-to-br from-[#00C853] via-[#00E676] to-[#00C853] rounded-2xl p-4 flex flex-col overflow-hidden h-full cursor-pointer transition-all duration-300 hover:shadow-[0_8px_36px_rgba(0,200,83,0.35)] hover:-translate-y-0.5"
      style={{ boxShadow: '0 4px 20px rgba(0, 200, 83, 0.2)' }}
    >
      <div className="absolute top-3 right-3 w-2.5 h-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 animate-ping" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white/80" />
      </div>
      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-white/5" />

      <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
        <img src={appSvgs.OngoingCall} alt="Ongoing Call" className="w-6 h-6" />
      </div>

      <div className="flex-1 flex flex-col justify-center py-2">
        <p className="text-white text-sm font-bold mb-0.5">Current Status</p>
        <p className="text-white/80 text-xs font-medium tabular-nums">{time}</p>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-lg p-2 flex-shrink-0">
        <div className="flex items-center gap-2 text-[#2D2D2D]">
          <div className="w-7 h-7 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-full flex items-center justify-center flex-shrink-0">
            {type === "chat" ? <Icons.MessageSquare size={14} className="text-[#4CAF50]" strokeWidth={2.5} />
              : type === "video" ? <Icons.Video size={14} className="text-[#4CAF50]" strokeWidth={2.5} />
              : <Icons.Phone size={14} className="text-[#4CAF50]" strokeWidth={2.5} />}
          </div>
          <p className="font-semibold text-[11px] leading-tight">
            Ongoing {sessionType} with {sessionId && `#${sessionId} `}{userName}
          </p>
        </div>
      </div>
    </div>
  );
};

const InactiveSessionCard = () => (
  <div
    className="relative bg-gradient-to-br from-[#FAFAFA] to-[#F0F0F0] rounded-2xl p-4 flex flex-col overflow-hidden h-full border border-gray-100/80 transition-all duration-300"
    style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}
  >
    <div className="w-10 h-10 bg-gradient-to-br from-[#E8E8E8] to-[#D8D8D8] rounded-xl flex items-center justify-center flex-shrink-0">
      <img src={appSvgs.OfflineCloud} alt="Offline" className="w-6 h-6 opacity-50" />
    </div>

    <div className="flex-1 flex flex-col justify-center py-2 relative z-10">
      <p className="text-[#2D2D2D] text-sm font-bold mb-0.5">No Active Session</p>
      <p className="text-[#9CA3AF] text-xs"></p>
    </div>

    <div className="border-t border-gray-200/60 pt-2 flex-shrink-0">
      <p className="text-[#9CA3AF] text-[11px] font-medium">Go live to start receiving consultations</p>
    </div>
  </div>
);

const CurrentStatusCard = ({ hasActiveSession, sessionData, onClick }) => {
  return hasActiveSession
    ? <ActiveSessionCard sessionData={sessionData} onClick={onClick} />
    : <InactiveSessionCard />;
};

export default CurrentStatusCard;
