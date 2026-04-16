import { Link } from "react-router-dom";
import SectionHeader from "../../UI/SectionHeader";
import CurrentStatusCard from "../CurrentStatusCard";
import { Icons } from "../../Icons";
import styles from "./TodaysUpdatesSection.module.scss";

const TodaysUpdatesSection = ({
  isActiveSession, sessionInfo, getSessionDuration, handleCurrentStatusClick,
  totalQueue, chatQueue, callQueue, waitingList = [],
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
      <div className="flex mb-3">
        <SectionHeader title="TODAY'S UPDATE" />
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Current Status */}
            <CurrentStatusCard
              hasActiveSession={isActiveSession}
              sessionData={sessionData}
              onClick={handleCurrentStatusClick}
            />

            {/* Queue */}
            <div className={styles.queueCard}>
              <div className={styles.queueGlow} />
              <div className="relative z-10">
                <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] tracking-tight mb-0.5">
                  {Number(totalQueue || 0)} in Queue
                </h3>
                <p className="text-[#6B7280] text-[11px] font-medium mb-2">Next Session</p>
                <div className={styles.queuePills}>
                  <span className={styles.queuePill}>
                    <span className={styles.pillDot} style={{ background: '#3B82F6' }} />
                    {Number(chatQueue || 0)} Chat
                  </span>
                  <span className={styles.queueDivider}>|</span>
                  <span className={styles.queuePill}>
                    <span className={styles.pillDot} style={{ background: '#4BA01D' }} />
                    {Number(callQueue || 0)} Call
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-[#1A1A1A]">Upcoming Sessions</p>
                <Link to="/upcoming-sessions" className="text-[10px] font-semibold text-[#F75801] hover:text-[#D43400] flex items-center gap-0.5 transition-colors">
                  {waitingList.length > 0 ? `${waitingList.length} waiting` : "View All"} <Icons.ArrowRight size={10} />
                </Link>
              </div>

              {waitingList.length === 0 ? (
                <div className="flex-1 flex items-center gap-3 bg-[#f8f9fa] rounded-xl p-3 border border-[rgba(0,0,0,0.04)]">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-[rgba(0,0,0,0.04)]">
                    <Icons.Calendar size={16} className="text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280]">No upcoming sessions</p>
                    <p className="text-[10px] text-[#9CA3AF]">Customers will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] hide-scrollbar">
                  {waitingList.slice(0, 3).map((session) => {
                    const customerName = session.user?.customer?.firstName
                      ? `${session.user.customer.firstName} ${session.user.customer.lastName || ""}`.trim()
                      : "Anonymous";
                    const initial = (session.user?.customer?.firstName || "U").charAt(0).toUpperCase();
                    const userImage = session.user?.customer?.imageUrl || session.user?.customer?.profileImage;

                    return (
                      <div key={session._id || session.roomId} className="flex items-center gap-2.5 bg-[#f8f9fa] rounded-xl p-2.5 border border-[rgba(0,0,0,0.04)]">
                        {userImage ? (
                          <img src={userImage} alt={customerName} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFE8C5] to-[#FFCB8E] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#F75801]/70">{initial}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[11px] font-semibold text-[#1A1A1A] truncate">{customerName}</p>
                          <p className="text-[10px] text-[#9CA3AF]">Incoming {session.type === "chat" ? "Chat" : session.type === "video" ? "Video Call" : "Call"}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {session.type === "chat"
                            ? <Icons.MessageSquare size={10} className="text-[#3B82F6]" />
                            : session.type === "video"
                            ? <Icons.Video size={10} className="text-[#F75801]" />
                            : <Icons.Phone size={10} className="text-[#4BA01D]" />}
                          <span className="text-[10px] text-[#9CA3AF] capitalize">{session.type || "call"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysUpdatesSection;
