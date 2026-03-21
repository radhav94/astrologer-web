import { Icons } from "../Icons";
import { appSvgs } from "../../utils/appImages";

const ActiveSessionCard = ({ sessionData, onClick }) => {
  const { userName = "Customer", sessionId = "", time = "--:--", sessionType = "Call", type = "audio" } = sessionData || {};

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-[#4CAF50] to-[#45A049] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col relative overflow-hidden h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[260px] shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-16 lg:h-16 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
        <img src={appSvgs.OngoingCall} alt="Ongoing Call" className="w-10 h-10 sm:w-14 sm:h-14 lg:w-11 lg:h-11" />
      </div>

      <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 lg:py-4">
        <p className="text-white text-lg sm:text-2xl lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-1">
          Current Status
        </p>
        <p className="text-white/90 text-base sm:text-xl lg:text-lg font-normal">
          {time}
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-xl p-3 sm:p-4 lg:p-3 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-2 text-[#2D2D2D]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
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
  <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col relative overflow-hidden h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[260px] shadow-md border border-gray-100 transition-all duration-300">
    <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-16 lg:h-16 bg-[#E5E7EB] rounded-full flex items-center justify-center flex-shrink-0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="sm:w-10 sm:h-10 lg:w-8 lg:h-8">
        <path d="M19.5 5.5L18 7M16.5 8.5L18 7M18 7L19.5 8.5M18 7L16.5 5.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 9.5C2 5.35786 5.35786 2 9.5 2C10.1723 2 10.8247 2.08236 11.4472 2.23776" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 14.5C22 18.6421 18.6421 22 14.5 22C13.8277 22 13.1753 21.9176 12.5528 21.7622" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 22L22 2" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>

    <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 lg:py-4">
      <p className="text-[#2D2D2D] text-lg sm:text-2xl lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-1">
        No Active Session
      </p>
      <p className="text-[#9CA3AF] text-base sm:text-xl lg:text-lg font-normal">
        You are offline
      </p>
    </div>

    <div className="border-t border-gray-200 pt-3 sm:pt-4 lg:pt-3 flex-shrink-0">
      <p className="text-[#9CA3AF] text-xs sm:text-base lg:text-sm font-medium leading-tight">
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
