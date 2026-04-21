import { Icons } from "../../../Icons";

/**
 * V6 — Streak/Challenge Cards: Urgency-driven fitness-app style
 */
const PERIOD_CONFIG = {
  daily: { color: "#F75801", gradient: "linear-gradient(135deg, #FF6B35 0%, #F75801 100%)", icon: "🔥" },
  weekly: { color: "#4BA01D", gradient: "linear-gradient(135deg, #6BCB77 0%, #4BA01D 100%)", icon: "💪" },
  monthly: { color: "#D7A24F", gradient: "linear-gradient(135deg, #FFD93D 0%, #D7A24F 100%)", icon: "🚀" },
};

const MilestoneV6Streak = ({ milestones = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {milestones.map((m, idx) => {
        const cfg = PERIOD_CONFIG[m.period] || { color: "#3B82F6", gradient: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)", icon: "🎯" };
        const remaining = Math.max(m.targetSessionsCount - m.completedSessionCount, 0);
        const pct = m.targetSessionsCount > 0 ? Math.min((m.completedSessionCount / m.targetSessionsCount) * 100, 100) : 0;
        const done = m.isCompleted || pct >= 100;

        return (
          <div key={m._id || idx} className="rounded-2xl overflow-hidden text-white relative"
            style={{ background: done ? "#1A1A1A" : cfg.gradient, boxShadow: `0 6px 24px ${cfg.color}30` }}>

            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background: "white" }} />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10" style={{ background: "white" }} />

            <div className="relative z-10 p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{cfg.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  {m.period}
                </span>
              </div>

              {/* Countdown */}
              {done ? (
                <div className="mb-3">
                  <p className="text-2xl font-black">Completed! 🎉</p>
                  <p className="text-xs text-white/70 mt-1">Claim your reward</p>
                </div>
              ) : (
                <div className="mb-3">
                  <p className="text-3xl font-black leading-none">{remaining}</p>
                  <p className="text-xs text-white/70 mt-1">sessions to go</p>
                </div>
              )}

              {/* Progress bar */}
              <div className="h-2 rounded-full overflow-hidden bg-white/20 mb-3">
                <div className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${Math.max(pct, 3)}%` }} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Icons.Gift size={12} />
                  <span className="text-sm font-bold">₹{Number(m.rewardAmount).toLocaleString("en-IN")}</span>
                </div>
                <span className="text-[10px] text-white/60 capitalize">{(m.targetSessionType || []).join(", ")}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneV6Streak;
