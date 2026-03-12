import { Icons } from "../../Icons";
import { appSvgs } from "../../../utils/appImages";
import SectionHeader from "../../UI/SectionHeader";

/**
 * Today's Updates Section Component
 * Displays current status, earnings, and queue information
 */
const TodaysUpdatesSection = ({ 
  isActiveSession, 
  sessionInfo, 
  getSessionDuration, 
  handleCurrentStatusClick,
  totalEarnings,
  totalQueue,
  chatQueue,
  callQueue
}) => {
  return (
    <div>
      <div className="flex mb-6">
        <SectionHeader title="TODAY'S UPDATE" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-4">
        {/* CURRENT STATUS */}
        <div 
          onClick={handleCurrentStatusClick}
          className={`bg-gradient-to-br from-[#4CAF50] to-[#45A049] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col relative overflow-hidden h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[260px] shadow-md ${isActiveSession ? 'cursor-pointer hover:shadow-lg transition-shadow' : 'cursor-default'}`}
        >
          <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-16 lg:h-16 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <img src={appSvgs.OngoingCall} alt="Ongoing Call" className="w-10 h-10 sm:w-14 sm:h-14 lg:w-11 lg:h-11" />
          </div>

          <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 lg:py-4">
            <p className="text-white text-lg sm:text-2xl lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-1">
              Current Status
            </p>
            <p className="text-white/90 text-base sm:text-xl lg:text-lg font-normal">
              {isActiveSession ? getSessionDuration() : "--:--"}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-xl p-3 sm:p-4 lg:p-3 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-2 text-[#2D2D2D]">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                {sessionInfo.type === "chat" ? (
                  <Icons.MessageSquare size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                ) : sessionInfo.type === "video" ? (
                  <Icons.Video size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                ) : (
                  <Icons.Phone size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                )}
              </div>
              <p className="font-semibold text-xs sm:text-base lg:text-sm leading-tight">
                {isActiveSession ? (
                  <>
                    Ongoing {sessionInfo.sessionType} with<br />
                    {sessionInfo.userId && `#${sessionInfo.userId} `}{sessionInfo.customerName}
                  </>
                ) : (
                  <>
                    No Active Session<br />
                    Ready to Connect
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (EARNINGS + NEXT SESSION) */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4">
          {/* TODAY'S EARNINGS */}
          <div className="bg-gradient-to-br from-[#FFF5E8] to-[#FFE8D4] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col justify-center min-h-[135px] sm:min-h-[150px] lg:min-h-[120px]">
            <h3 className="text-3xl sm:text-5xl lg:text-4xl font-bold text-[#2D2D2D] mb-1 sm:mb-2 lg:mb-1">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </h3>
            <p className="text-[#9CA3AF] text-sm sm:text-lg lg:text-base font-normal">
              Total Earning
            </p>
          </div>

          {/* NEXT SESSION */}
          <div className="bg-gradient-to-br from-[#E7EEF8] to-[#B8D4F1] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col justify-center min-h-[135px] sm:min-h-[150px] lg:min-h-[120px]">
            <h3 className="text-2xl sm:text-4xl lg:text-3xl font-bold text-[#2D2D2D] mb-1 sm:mb-2 lg:mb-1">
              {totalQueue} in Queue
            </h3>
            <p className="text-[#9CA3AF] text-sm sm:text-lg lg:text-base font-normal mb-3 sm:mb-4 lg:mb-3">
              Next Session
            </p>

            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-xl px-3 py-2.5 sm:px-5 sm:py-3.5 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2 sm:gap-4 lg:gap-3">
              <span className="text-[#6B7280] text-sm sm:text-lg lg:text-base font-semibold">
                {chatQueue} Chat
              </span>
              <span className="text-[#D1D5DB] text-xl sm:text-2xl lg:text-xl font-light">|</span>
              <span className="text-[#6B7280] text-sm sm:text-lg lg:text-base font-semibold">
                {callQueue} Call
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysUpdatesSection;
