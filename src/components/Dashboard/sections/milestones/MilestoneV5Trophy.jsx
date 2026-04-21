import { Icons } from "../../../Icons";

/**
 * V5 — Trophy Shelf: Orange-themed, blends with dashboard brand
 */
const TROPHIES = {
  daily: { icon: "⚡", label: "Daily Challenge" },
  weekly: { icon: "🔥", label: "Weekly Goal" },
  monthly: { icon: "👑", label: "Monthly Quest" },
};

const MilestoneV5Trophy = ({ milestones = [], isLoading }) => {
  if (isLoading) {
    return <div className="h-64 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />;
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-0 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-[#F75801]/40 uppercase tracking-[0.15em]">Milestones</p>
          <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">Earn More With Milestones!</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#FFF5EE", border: "1px solid rgba(247,88,1,0.1)" }}>
          <Icons.Gift size={12} className="text-[#F75801]" />
          <span className="text-[11px] font-bold text-[#F75801]">
            ₹{milestones.reduce((sum, m) => sum + (m.rewardAmount || 0), 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-[#F75801]/40">total</span>
        </div>
      </div>

      {/* Trophy cards */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {milestones.map((m, idx) => {
          const cfg = TROPHIES[m.period] || { icon: "🏆", label: m.period };
          const pct = m.targetSessionsCount > 0 ? Math.min((m.completedSessionCount / m.targetSessionsCount) * 100, 100) : 0;
          const done = m.isCompleted || pct >= 100;
          const remaining = Math.max(m.targetSessionsCount - m.completedSessionCount, 0);

          return (
            <div key={m._id || idx}
              className="relative rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
              style={{
                background: done ? "linear-gradient(135deg, #FFF5EE 0%, #FFE8D6 100%)" : "#FFFAF7",
                border: done ? "1px solid rgba(247,88,1,0.2)" : "1px solid rgba(247,88,1,0.08)",
              }}>

              <div className="relative z-10">
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white"
                      style={{
                        border: "1px solid rgba(247,88,1,0.12)",
                        boxShadow: done ? "0 4px 12px rgba(247,88,1,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
                      }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">{cfg.label}</p>
                      <p className="text-[10px] text-[#F75801]/40 capitalize">{(m.targetSessionType || []).join(", ")}</p>
                    </div>
                  </div>
                  {done && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#F75801]">
                      <Icons.Check size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-[11px] text-[#6B7280] mb-3 line-clamp-1">{m.description || m.tittle}</p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#1A1A1A] text-lg font-black tabular-nums">
                      {m.completedSessionCount}<span className="text-[#9CA3AF] text-xs font-medium"> / {m.targetSessionsCount}</span>
                    </span>
                    <span className="text-[10px] font-bold tabular-nums text-[#F75801]">
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(247,88,1,0.08)" }}>
                    <div className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{
                        width: `${Math.max(pct, 3)}%`,
                        background: "linear-gradient(90deg, #FF9A44 0%, #F75801 100%)",
                      }}>
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white" style={{ border: "1px solid rgba(247,88,1,0.1)" }}>
                    <Icons.Gift size={11} className="text-[#F75801]" />
                    <span className="text-[11px] font-bold text-[#F75801]">₹{Number(m.rewardAmount).toLocaleString("en-IN")}</span>
                  </div>
                  {done ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#F75801]/10 text-[#F75801]">
                      Completed ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#9CA3AF]">
                      <span className="font-bold text-[#F75801]">{remaining}</span> sessions left
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneV5Trophy;
