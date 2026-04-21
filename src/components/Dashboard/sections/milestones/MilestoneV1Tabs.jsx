import { useState, useMemo } from "react";
import { Icons } from "../../../Icons";

/**
 * V1 — Tab-based: Daily / Weekly / Monthly tabs, each showing a card with circular progress ring
 */
const CircleProgress = ({ pct, color, size = 80, strokeWidth = 6 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        className="transition-all duration-700 ease-out" />
    </svg>
  );
};

const MilestoneV1Tabs = ({ milestones = [], isLoading }) => {
  const tabs = useMemo(() => ["daily", "weekly", "monthly"], []);
  const [active, setActive] = useState("daily");

  const current = milestones.find((m) => m.period === active);

  if (isLoading) {
    return <div className="h-48 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.06)" }} />;
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
      {/* Tabs */}
      <div className="flex border-b border-[rgba(0,0,0,0.06)]">
        {tabs.map((t) => {
          const exists = milestones.some((m) => m.period === t);
          return (
            <button key={t} onClick={() => setActive(t)} disabled={!exists}
              className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors
                ${active === t ? "text-[#F75801] border-b-2 border-[#F75801] bg-[#FFF8F5]" : "text-[#9CA3AF] hover:text-[#6B7280]"}
                ${!exists ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {current ? (
        <div className="p-5 flex flex-col items-center gap-4">
          <div className="relative">
            <CircleProgress
              pct={current.targetSessionsCount > 0 ? Math.min((current.completedSessionCount / current.targetSessionsCount) * 100, 100) : 0}
              color={current.isCompleted ? "#4BA01D" : "#F75801"}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[#1A1A1A]">{current.completedSessionCount}</span>
              <span className="text-[10px] text-[#9CA3AF]">of {current.targetSessionsCount}</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-[#1A1A1A]">{current.tittle}</p>
            <p className="text-xs text-[#6B7280] mt-1">{current.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0E6]">
              <Icons.Gift size={12} className="text-[#F75801]" />
              <span className="text-xs font-semibold text-[#F75801]">₹{Number(current.rewardAmount).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3f4f6]">
              <span className="text-[10px] text-[#6B7280] capitalize">{(current.targetSessionType || []).join(", ")}</span>
            </div>
          </div>

          {current.isCompleted && (
            <span className="text-xs font-semibold text-[#4BA01D] bg-[#E8F5E9] px-3 py-1 rounded-full">Completed ✓</span>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-[#9CA3AF]">No milestone for this period</p>
        </div>
      )}
    </div>
  );
};

export default MilestoneV1Tabs;
