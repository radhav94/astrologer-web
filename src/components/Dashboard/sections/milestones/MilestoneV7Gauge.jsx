import { Icons } from "../../../Icons";

/**
 * V7 — Speedometer Gauges: Dashboard-style semi-circular gauges
 */
const PERIOD_CONFIG = {
  daily: { color: "#F75801", label: "Daily" },
  weekly: { color: "#4BA01D", label: "Weekly" },
  monthly: { color: "#D7A24F", label: "Monthly" },
};

const Gauge = ({ pct, color, size = 120 }) => {
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  // Semi-circle: half circumference
  const halfCirc = Math.PI * r;
  const offset = halfCirc * (1 - Math.min(pct, 100) / 100);

  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
      {/* Track */}
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none" stroke="#f0f0f0" strokeWidth={strokeWidth} strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={halfCirc} strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
      {/* Needle dot */}
      {(() => {
        const angle = Math.PI * (1 - Math.min(pct, 100) / 100);
        const nx = size / 2 + r * Math.cos(angle);
        const ny = size / 2 - r * Math.sin(angle);
        return <circle cx={nx} cy={ny} r={5} fill={color} className="transition-all duration-1000 ease-out drop-shadow-sm" />;
      })()}
    </svg>
  );
};

const MilestoneV7Gauge = ({ milestones = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {milestones.map((m, idx) => {
        const cfg = PERIOD_CONFIG[m.period] || { color: "#3B82F6", label: m.period };
        const pct = m.targetSessionsCount > 0 ? (m.completedSessionCount / m.targetSessionsCount) * 100 : 0;
        const done = m.isCompleted || pct >= 100;

        return (
          <div key={m._id || idx}
            className="rounded-2xl p-5 flex flex-col items-center text-center"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>

            {/* Period label */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
              style={{ background: `${cfg.color}12`, color: cfg.color }}>
              {cfg.label}
            </span>

            {/* Gauge */}
            <div className="relative">
              <Gauge pct={pct} color={done ? "#4BA01D" : cfg.color} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p className="text-xl font-black text-[#1A1A1A]">{Math.round(pct)}%</p>
              </div>
            </div>

            {/* Stats */}
            <p className="text-xs text-[#6B7280] mt-1">
              <span className="font-bold text-[#1A1A1A]">{m.completedSessionCount}</span> / {m.targetSessionsCount} sessions
            </p>

            {/* Reward + type */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: `${cfg.color}10` }}>
                <Icons.Gift size={10} style={{ color: cfg.color }} />
                <span className="text-[10px] font-bold" style={{ color: cfg.color }}>₹{Number(m.rewardAmount).toLocaleString("en-IN")}</span>
              </div>
              <span className="text-[9px] text-[#9CA3AF] capitalize">{(m.targetSessionType || []).join(", ")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneV7Gauge;
