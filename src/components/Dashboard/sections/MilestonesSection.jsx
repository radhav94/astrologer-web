import SectionHeader from "../../UI/SectionHeader";

const milestones = [
  {
    id: 1,
    emoji: "⚡",
    label: "Starter",
    target: 15,
    current: 0,
    reward: "₹30,000",
    color: "#F75801",
    bgLight: "rgba(247, 88, 1, 0.08)",
    hint: "Complete 15 sessions",
  },
  {
    id: 2,
    emoji: "🎯",
    label: "Master",
    target: 30,
    current: 3,
    reward: "₹50,000",
    color: "#4BA01D",
    bgLight: "rgba(75, 160, 29, 0.08)",
    hint: "Complete 30 sessions",
  },
  {
    id: 3,
    emoji: "⭐",
    label: "Champion",
    target: 5.0,
    current: 4.5,
    reward: "₹5,000",
    color: "#D7A24F",
    bgLight: "rgba(215, 162, 79, 0.1)",
    hint: "Maintain 5.0 rating",
  },
];

const MilestonesSection = () => {
  return (
    <div>
      <div className="flex mb-4">
        <SectionHeader title="MILESTONES" />
      </div>

      <div
        className="rounded-2xl p-4 sm:p-6"
        style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Roadmap track */}
        <div className="relative flex items-start justify-between gap-2 mb-6">
          {/* Connecting line behind nodes */}
          <div className="absolute top-5 left-[calc(16.66%)] right-[calc(16.66%)] h-[3px] bg-[#f0f0f0] rounded-full z-0" />

          {milestones.map((m, idx) => {
            const pct = Math.min((m.current / m.target) * 100, 100);
            const done = pct >= 100;

            return (
              <div key={m.id} className="flex flex-col items-center flex-1 relative z-10">
                {/* Node */}
                <div
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-transform duration-300 hover:scale-110"
                  style={{
                    background: done ? m.color : "#fff",
                    border: `3px solid ${m.color}`,
                    boxShadow: done ? `0 4px 14px ${m.color}40` : `0 2px 8px rgba(0,0,0,0.06)`,
                  }}
                >
                  {done ? "✓" : m.emoji}
                  {/* Animated ring for in-progress */}
                  {!done && pct > 0 && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="19" fill="none" stroke={m.color} strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 19}`}
                        strokeDashoffset={`${2 * Math.PI * 19 * (1 - pct / 100)}`}
                        className="transition-all duration-1000 ease-out"
                        opacity="0.35"
                      />
                    </svg>
                  )}
                </div>

                {/* Label + reward */}
                <p className="text-[11px] sm:text-xs font-bold text-[#1A1A1A] mt-2 text-center">{m.label}</p>
                <p className="text-[10px] font-semibold mt-0.5 text-center" style={{ color: m.color }}>{m.reward}</p>
              </div>
            );
          })}
        </div>

        {/* Detail cards */}
        <div className="space-y-2">
          {milestones.map((m) => {
            const pct = Math.round(Math.min((m.current / m.target) * 100, 100));
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[#f8f9fa]"
                style={{ border: "1px solid rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: m.bgLight }}
                >
                  {m.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-[#1A1A1A]">{m.hint}</p>
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: m.color }}>
                      {m.current}/{m.target}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: m.bgLight }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: `linear-gradient(90deg, ${m.color} 0%, ${m.color}BB 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MilestonesSection;
