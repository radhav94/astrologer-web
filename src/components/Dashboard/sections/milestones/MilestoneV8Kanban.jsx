import { Icons } from "../../../Icons";

/**
 * V8 — Kanban Columns: In Progress / Almost There / Completed
 */
const PERIOD_COLORS = { daily: "#F75801", weekly: "#4BA01D", monthly: "#D7A24F" };
const PERIOD_EMOJI = { daily: "⚡", weekly: "🎯", monthly: "⭐" };

const COLUMNS = [
  { key: "progress", label: "In Progress", color: "#3B82F6", bg: "#EFF6FF", icon: "🏃" },
  { key: "almost", label: "Almost There", color: "#F59E0B", bg: "#FFFBEB", icon: "🔥" },
  { key: "done", label: "Completed", color: "#4BA01D", bg: "#F0FDF4", icon: "🏆" },
];

const getColumn = (m) => {
  const pct = m.targetSessionsCount > 0 ? (m.completedSessionCount / m.targetSessionsCount) * 100 : 0;
  if (m.isCompleted || pct >= 100) return "done";
  if (pct >= 60) return "almost";
  return "progress";
};

const MilestoneV8Kanban = ({ milestones = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />)}
      </div>
    );
  }

  const grouped = { progress: [], almost: [], done: [] };
  milestones.forEach((m) => {
    const col = getColumn(m);
    grouped[col].push(m);
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {COLUMNS.map((col) => (
        <div key={col.key} className="rounded-2xl overflow-hidden"
          style={{ background: col.bg, border: `1px solid ${col.color}20` }}>

          {/* Column header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: `${col.color}15` }}>
            <span className="text-sm">{col.icon}</span>
            <span className="text-xs font-bold" style={{ color: col.color }}>{col.label}</span>
            <span className="ml-auto text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: `${col.color}20`, color: col.color }}>
              {grouped[col.key].length}
            </span>
          </div>

          {/* Cards */}
          <div className="p-3 space-y-2 min-h-[100px]">
            {grouped[col.key].length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-[10px] text-[#9CA3AF]">No milestones here</p>
              </div>
            ) : (
              grouped[col.key].map((m, idx) => {
                const mColor = PERIOD_COLORS[m.period] || "#3B82F6";
                const emoji = PERIOD_EMOJI[m.period] || "🎖️";
                const pct = m.targetSessionsCount > 0 ? Math.round(Math.min((m.completedSessionCount / m.targetSessionsCount) * 100, 100)) : 0;

                return (
                  <div key={m._id || idx}
                    className="bg-white rounded-xl p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{emoji}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded capitalize"
                        style={{ background: `${mColor}12`, color: mColor }}>
                        {m.period}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-[#1A1A1A] mb-1.5 line-clamp-1">{m.description || m.tittle}</p>

                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#f0f0f0]">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(pct, 3)}%`, background: mColor }} />
                      </div>
                      <span className="text-[9px] font-bold tabular-nums" style={{ color: mColor }}>{pct}%</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Icons.Gift size={9} className="text-[#F59E0B]" />
                        <span className="text-[10px] font-bold text-[#F59E0B]">₹{Number(m.rewardAmount).toLocaleString("en-IN")}</span>
                      </div>
                      <span className="text-[9px] text-[#9CA3AF]">{m.completedSessionCount}/{m.targetSessionsCount}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MilestoneV8Kanban;
