import { useState, useMemo } from "react";
import SectionHeader from "../../UI/SectionHeader";
import { useGetAllMilestonesQuery } from "../../../redux/milestone/milestoneApi";
import MilestoneV1Tabs from "./milestones/MilestoneV1Tabs";
import MilestoneV2Timeline from "./milestones/MilestoneV2Timeline";
import MilestoneV3Cards from "./milestones/MilestoneV3Cards";
import MilestoneV4Compact from "./milestones/MilestoneV4Compact";
import MilestoneV5Trophy from "./milestones/MilestoneV5Trophy";
import MilestoneV6Streak from "./milestones/MilestoneV6Streak";
import MilestoneV7Gauge from "./milestones/MilestoneV7Gauge";
import MilestoneV8Kanban from "./milestones/MilestoneV8Kanban";

const PERIOD_ORDER = { daily: 0, weekly: 1, monthly: 2 };

const MilestonesSection = () => {
  const { data, isLoading, isError } = useGetAllMilestonesQuery();
  const [version, setVersion] = useState(1);

  const milestones = useMemo(() => {
    const list = data?.data || [];
    return [...list].sort((a, b) => (PERIOD_ORDER[a.period] ?? 9) - (PERIOD_ORDER[b.period] ?? 9));
  }, [data]);

  if (isError && !isLoading) {
    return (
      <div>
        <div className="flex mb-4"><SectionHeader title="MILESTONES" /></div>
        <div className="rounded-2xl p-6 bg-white text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-sm text-[#9CA3AF]">No milestones available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="MILESTONES" />
        {/* Version switcher — remove this once you pick a design */}
        <div className="flex gap-1 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
            <button key={v} onClick={() => setVersion(v)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors
                ${version === v ? "bg-[#F75801] text-white" : "bg-[#f3f4f6] text-[#6B7280] hover:bg-[#e5e7eb]"}`}
            >
              V{v}
            </button>
          ))}
        </div>
      </div>

      {version === 1 && <MilestoneV1Tabs milestones={milestones} isLoading={isLoading} />}
      {version === 2 && <MilestoneV2Timeline milestones={milestones} isLoading={isLoading} />}
      {version === 3 && <MilestoneV3Cards milestones={milestones} isLoading={isLoading} />}
      {version === 4 && <MilestoneV4Compact milestones={milestones} isLoading={isLoading} />}
      {version === 5 && <MilestoneV5Trophy milestones={milestones} isLoading={isLoading} />}
      {version === 6 && <MilestoneV6Streak milestones={milestones} isLoading={isLoading} />}
      {version === 7 && <MilestoneV7Gauge milestones={milestones} isLoading={isLoading} />}
      {version === 8 && <MilestoneV8Kanban milestones={milestones} isLoading={isLoading} />}
    </div>
  );
};

export default MilestonesSection;
