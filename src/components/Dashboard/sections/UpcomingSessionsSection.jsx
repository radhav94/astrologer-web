import { Link } from "react-router-dom";
import { Icons } from "../../Icons";
import SectionHeader from "../../UI/SectionHeader";

/**
 * Upcoming Sessions Section Component
 * Displays list of upcoming consultation sessions
 */
const UpcomingSessionsSection = ({ waitingList }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="UPCOMING SESSIONS" />
        <Link
          to="/upcoming-sessions"
          className="text-base text-[#FF6B35] hover:text-[#E55A2B] font-semibold flex items-center gap-1 ml-4"
        >
          View All <Icons.ArrowRight size={18} />
        </Link>
      </div>

      {waitingList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-[#6B7280] text-lg">No upcoming sessions at the moment</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-4 hide-scrollbar snap-x snap-mandatory">
          {waitingList.slice(0, 5).map((session) => {
            const customerName = session.user?.customer?.firstName 
              ? `${session.user.customer.firstName} ${session.user.customer.lastName || ''}`.trim()
              : "Anonymous User";
            const userImage = session.user?.customer?.imageUrl || session.user?.customer?.profileImage;
            
            return (
              <div
                key={session._id || session.roomId}
                className="min-w-[220px] sm:min-w-[320px] bg-white rounded-2xl sm:rounded-3xl shadow-md snap-start border border-gray-100 overflow-hidden flex-shrink-0"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt={customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FFE8C5] to-[#FFD4A3] flex items-center justify-center">
                      <span className="text-4xl sm:text-6xl font-bold text-[#FF6B35]">
                        {(session.user?.customer?.firstName || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md">
                    <Icons.Clock size={14} className="text-[#FF6B35] sm:w-4 sm:h-4" strokeWidth={2.5} />
                    <span className="text-xs sm:text-sm font-medium text-[#6B7280]">10 min</span>
                  </div>
                </div>

                <div className="p-3 sm:p-5">
                  <h4 className="font-bold text-[#2D2D2D] text-base sm:text-xl mb-1.5 sm:mb-2">
                    {customerName}
                  </h4>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[#6B7280]">
                    {session.type === "chat" ? (
                      <Icons.MessageSquare size={16} className="text-[#FF6B35] sm:w-5 sm:h-5" strokeWidth={2} />
                    ) : session.type === "video" ? (
                      <Icons.Video size={16} className="text-[#FF6B35] sm:w-5 sm:h-5" strokeWidth={2} />
                    ) : (
                      <Icons.Phone size={16} className="text-[#FF6B35] sm:w-5 sm:h-5" strokeWidth={2} />
                    )}
                    <p className="text-sm sm:text-base font-normal text-[#6B7280] capitalize">
                      {session.type === "chat" ? "Chat" : "Call"} session
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="min-w-[20px]"></div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessionsSection;
