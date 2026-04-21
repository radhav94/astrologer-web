import { Icons } from "../../../Icons";

/**
 * V3 — Gamified cards with big circular progress, reward badge, horizontal grid
 */
const PERIOD_CONFIG = {
  daily: { emoji: "⚡", color: "#F75801", gradient: "linear-gradient(135deg, #FFF5EE 0%, #FFE8D6 100%)" },
  weekly: { emoji: "🔥", color: "#4BA01D", gradient: "linear-gradient(135deg, #F0FFF0 0%, #DCFCE7 100%)" },
  monthly: { emoji: "🏆", color: "#D7A24F", gradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" },
};

const MilestoneV3Cards = ({ milestones = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-56 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {milestones.map((m, idx) => {
        const cfg = PERIOD_CONFIG[m.period] || { emoji: "🎯", color: "#3B82F6", gradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" };
        const pct = m.targetSessionsCount > 0 ? Math.min((m.completedSessionCount / m.targetSessionsCount) * 100, 100) : 0;
        const r = 34;
        const circ = 2 * Math.PI * r;

        return (
          <div
            key={m._id || idx}
            className="rounded-2xl p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1"
            style={{ background: cfg.gradient, border: `1px solid ${cfg.color}20`, boxShadow: `0 4px 16px ${cfg.color}10` }}
          >
            {/* Period badge */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
              style={{ background: `${cfg.color}15`, color: cfg.color }}>
              {m.period}
            </span>

            {/* Circular progress */}
            <div className="relative mb-3">
              <svg width={80} height={80} className="-rotate-90">
                <circle cx={40} cy={40} r={r} fill="none" stroke={`${cfg.color}20`} strokeWidth={6} />
                <circle cx={40} cy={40} r={r} fill="none" stroke={cfg.color} strokeWidth={6}
                  strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
                  className="transition-all duration-700 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {m.isCompleted ? "✅" : cfg.emoji}
              </div>
            </div>

            {/* Stats */}
            <p className="text-xl font-bold text-[#1A1A1A]">{m.completedSessionCount}<span className="text-sm text-[#9CA3AF] font-medium">/{m.targetSessionsCount}</span></p>
            <p className="text-[11px] text-[#6B7280] mt-1 mb-3 line-clamp-2">{m.description || m.tittle}</p>

            {/* Reward + type */}
            <div className="mt-auto flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80" style={{ border: `1px solid ${cfg.color}30` }}>
                <Icons.Gift size={11} style={{ color: cfg.color }} />
                <span className="text-[11px] font-bold" style={{ color: cfg.color }}>₹{Number(m.rewardAmount).toLocaleString("en-IN")}</span>
              </div>
              <span className="text-[10px] text-[#9CA3AF] capitalize">{(m.targetSessionType || []).join(", ")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneV3Cards;
