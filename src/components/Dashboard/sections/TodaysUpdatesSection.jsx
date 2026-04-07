import SectionHeader from "../../UI/SectionHeader";
import CurrentStatusCard from "../CurrentStatusCard";

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
  const sessionData = isActiveSession ? {
    userName: sessionInfo.customerName,
    sessionId: sessionInfo.userId,
    time: getSessionDuration(),
    sessionType: sessionInfo.sessionType,
    type: sessionInfo.type,
  } : null;

  return (
    <div>
      <div className="flex mb-6">
        <SectionHeader title="TODAY'S UPDATE" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-4">
        {/* CURRENT STATUS */}
        <CurrentStatusCard
          hasActiveSession={isActiveSession}
          sessionData={sessionData}
          onClick={handleCurrentStatusClick}
        />

        {/* RIGHT COLUMN (EARNINGS + NEXT SESSION) */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4">
          {/* TODAY'S EARNINGS */}
          <div className="bg-gradient-to-br from-[#FFF5E8] to-[#FFE8D4] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col justify-center min-h-[135px] sm:min-h-[150px] lg:min-h-[120px]">
            <h3 className="text-2xl sm:text-5xl lg:text-4xl font-bold text-[#2D2D2D] mb-1 sm:mb-2 lg:mb-1">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </h3>
            <p className="text-[#9CA3AF] text-sm sm:text-lg lg:text-base font-normal">
              Today's Earning
            </p>
          </div>

          {/* NEXT SESSION */}
          <div className="bg-gradient-to-br from-[#E7EEF8] to-[#B8D4F1] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col justify-center min-h-[135px] sm:min-h-[150px] lg:min-h-[120px]">
            <h3 className="text-1xl sm:text-4xl lg:text-3xl font-bold text-[#2D2D2D] mb-1 sm:mb-2 lg:mb-1">
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
