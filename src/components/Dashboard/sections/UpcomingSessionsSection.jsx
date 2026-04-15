import { Link } from "react-router-dom";
import { Icons } from "../../Icons";
import SectionHeader from "../../UI/SectionHeader";

const UpcomingSessionsSection = ({ waitingList }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionHeader title="UPCOMING SESSIONS" />
        <Link to="/upcoming-sessions" className="text-xs text-[#F75801] hover:text-[#D43400] font-semibold flex items-center gap-1 transition-colors">
          View All <Icons.ArrowRight size={14} />
        </Link>
      </div>

      {waitingList.length === 0 ? (
        <div className="bg-white rounded-2xl px-6 py-5 text-center border border-gray-100/80" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D4] rounded-xl flex items-center justify-center">
            <Icons.Calendar size={18} className="text-[#F75801] opacity-60" />
          </div>
          <p className="text-[#6B7280] text-xs font-medium">No upcoming sessions</p>
          <p className="text-[#9CA3AF] text-[11px] mt-0.5">Sessions appear when customers join the queue</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar snap-x snap-mandatory">
          {waitingList.slice(0, 5).map((session, index) => {
            const customerName = session.user?.customer?.firstName 
              ? `${session.user.customer.firstName} ${session.user.customer.lastName || ''}`.trim()
              : "Anonymous User";
            const userImage = session.user?.customer?.imageUrl || session.user?.customer?.profileImage;
            
            return (
              <div
                key={session._id || session.roomId}
                className="min-w-[180px] sm:min-w-[240px] bg-white rounded-xl snap-start overflow-hidden flex-shrink-0 border border-gray-100/80 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <div className="relative w-full aspect-[3/2] overflow-hidden">
                  {userImage ? (
                    <img src={userImage} alt={customerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FFE8C5] to-[#FFCB8E] flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#F75801]/60">
                        {(session.user?.customer?.firstName || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Icons.Clock size={11} className="text-[#F75801]" strokeWidth={2.5} />
                    <span className="text-[10px] font-medium text-[#6B7280]">10 min</span>
                  </div>
                </div>
                <div className="p-2.5">
                  <h4 className="font-bold text-[#2D2D2D] text-xs mb-1">{customerName}</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFF5EC] to-[#FFE8D4] flex items-center justify-center">
                      {session.type === "chat" ? <Icons.MessageSquare size={10} className="text-[#F75801]" />
                        : session.type === "video" ? <Icons.Video size={10} className="text-[#F75801]" />
                        : <Icons.Phone size={10} className="text-[#F75801]" />}
                    </div>
                    <p className="text-[11px] font-medium text-[#6B7280] capitalize">{session.type === "chat" ? "Chat" : "Call"}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="min-w-[12px]" />
        </div>
      )}
    </div>
  );
};

export default UpcomingSessionsSection;
