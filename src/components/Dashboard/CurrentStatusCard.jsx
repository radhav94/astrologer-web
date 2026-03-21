import { Icons } from "../Icons";
import { appSvgs } from "../../utils/appImages";

const ActiveSessionCard = ({ sessionData, onClick }) => {
  const { userName = "Customer", sessionId = "", time = "--:--", sessionType = "Call", type = "audio" } = sessionData || {};

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-[#4CAF50] to-[#45A049] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col relative overflow-hidden h-full min-h-[200px] sm:min-h-[320px] lg:min-h-[260px] shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-16 lg:h-16 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
        <img src={appSvgs.OngoingCall} alt="Ongoing Call" className="w-8 h-8 sm:w-14 sm:h-14 lg:w-11 lg:h-11" />
      </div>

      <div className="flex-1 flex flex-col justify-center py-3 sm:py-6 lg:py-4">
        <p className="text-white text-base sm:text-2xl lg:text-xl font-bold mb-0.5 sm:mb-2 lg:mb-1">
          Current Status
        </p>
        <p className="text-white/90 text-sm sm:text-xl lg:text-lg font-normal">
          {time}
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-xl p-2.5 sm:p-4 lg:p-3 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-2 text-[#2D2D2D]">
          <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            {type === "chat" ? (
              <Icons.MessageSquare size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
            ) : type === "video" ? (
              <Icons.Video size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
            ) : (
              <Icons.Phone size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
            )}
          </div>
          <p className="font-semibold text-xs sm:text-base lg:text-sm leading-tight">
            Ongoing {sessionType} with<br />
            {sessionId && `#${sessionId} `}{userName}
          </p>
        </div>
      </div>
    </div>
  );
};

const InactiveSessionCard = () => (
  <div className="bg-[#F5F5F5] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col relative overflow-hidden h-full min-h-[200px] sm:min-h-[320px] lg:min-h-[260px] shadow-sm border border-gray-100 transition-all duration-300">
    <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-16 lg:h-16 bg-[#E0E0E0] rounded-full flex items-center justify-center flex-shrink-0">
      <img src={appSvgs.OfflineCloud} alt="Offline" className="w-7 h-7 sm:w-12 sm:h-12 lg:w-9 lg:h-9 opacity-60" />
    </div>

    <div className="flex-1 flex flex-col justify-center py-3 sm:py-6 lg:py-4">
      <p className="text-[#2D2D2D] text-base sm:text-2xl lg:text-xl font-bold mb-0.5 sm:mb-2 lg:mb-1">
        No Active Session
      </p>
      <p className="text-[#9CA3AF] text-sm sm:text-xl lg:text-lg font-normal">
        You are offline
      </p>
    </div>

    <div className="border-t border-gray-300 pt-3 sm:pt-4 lg:pt-3 flex-shrink-0">
      <p className="text-[#9CA3AF] text-xs sm:text-base lg:text-sm font-medium leading-snug">
        Go live to start receiving consultations
      </p>
    </div>
  </div>
);

const CurrentStatusCard = ({ hasActiveSession, sessionData, onClick }) => {
  return hasActiveSession
    ? <ActiveSessionCard sessionData={sessionData} onClick={onClick} />
    : <InactiveSessionCard />;
};

export default CurrentStatusCard;
