import { Icons } from "../../../Icons";

/**
 * V2 — Vertical timeline/stepper with each milestone as a step
 */
const PERIOD_COLORS = { daily: "#F75801", weekly: "#4BA01D", monthly: "#D7A24F" };

const MilestoneV2Timeline = ({ milestones = [], isLoading }) => {
  if (isLoading) {
    return <div className="h-48 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />;
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="relative">
        {milestones.map((m, idx) => {
          const color = PERIOD_COLORS[m.period] || "#3B82F6";
          const pct = m.targetSessionsCount > 0 ? Math.round(Math.min((m.completedSessionCount / m.targetSessionsCount) * 100, 100)) : 0;
          const isLast = idx === milestones.length - 1;

          return (
            <div key={m._id || idx} className="flex gap-4 relative">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-white text-xs font-bold"
                  style={{ background: m.isCompleted ? color : "#fff", border: `3px solid ${color}`, color: m.isCompleted ? "#fff" : color }}
                >
                  {m.isCompleted ? "✓" : idx + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 min-h-[40px]" style={{ background: `${color}30` }} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 ${!isLast ? "pb-5" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold capitalize" style={{ color }}>{m.period}</span>
                  <span className="text-[10px] text-[#9CA3AF] capitalize">• {(m.targetSessionType || []).join(", ")}</span>
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">{m.description || m.tittle}</p>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#f0f0f0]">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
                  </div>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
                    {m.completedSessionCount}/{m.targetSessionsCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Icons.Gift size={12} className="text-[#F59E0B]" />
                  <span className="text-xs font-semibold text-[#F59E0B]">₹{Number(m.rewardAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneV2Timeline;
