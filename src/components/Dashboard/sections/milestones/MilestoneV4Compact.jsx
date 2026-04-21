import { Icons } from "../../../Icons";

/**
 * V4 — Compact list with progress badges and claim button
 */
const PERIOD_COLORS = { daily: "#F75801", weekly: "#4BA01D", monthly: "#D7A24F" };
const PERIOD_ICONS = { daily: "⚡", weekly: "🎯", monthly: "⭐" };

const MilestoneV4Compact = ({ milestones = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
      {milestones.map((m, idx) => {
        const color = PERIOD_COLORS[m.period] || "#3B82F6";
        const emoji = PERIOD_ICONS[m.period] || "🏆";
        const pct = m.targetSessionsCount > 0 ? Math.round(Math.min((m.completedSessionCount / m.targetSessionsCount) * 100, 100)) : 0;
        const isLast = idx === milestones.length - 1;

        return (
          <div key={m._id || idx}
            className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? "border-b border-[rgba(0,0,0,0.04)]" : ""}`}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: `${color}12` }}>
              {emoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold text-[#1A1A1A] truncate">{m.description || m.tittle}</p>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded capitalize flex-shrink-0"
                  style={{ background: `${color}12`, color }}>
                  {m.period}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#f0f0f0]">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
                </div>
                <span className="text-[10px] font-bold tabular-nums text-[#6B7280]">{pct}%</span>
              </div>
            </div>

            {/* Reward / Status */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Icons.Gift size={10} className="text-[#F59E0B]" />
                <span className="text-[11px] font-bold text-[#F59E0B]">₹{Number(m.rewardAmount).toLocaleString("en-IN")}</span>
              </div>
              {m.isCompleted ? (
                <button className="text-[10px] font-semibold text-white px-2.5 py-1 rounded-full" style={{ background: "#4BA01D" }}>
                  Claim
                </button>
              ) : (
                <span className="text-[10px] text-[#9CA3AF]">{m.completedSessionCount}/{m.targetSessionsCount}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneV4Compact;
