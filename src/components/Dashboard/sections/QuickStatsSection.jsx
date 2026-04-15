import { Icons } from "../../Icons";
import SectionHeader from "../../UI/SectionHeader";

const statConfig = [
  { key: "rating", label: "Rating", icon: <Icons.Star size={15} fill="currentColor" />, accent: "#F75801", iconBg: "rgba(247, 88, 1, 0.1)", format: (v) => v?.toFixed(1) || "0.0" },
  { key: "sessions", label: "Sessions", icon: <Icons.Phone size={15} />, accent: "#4BA01D", iconBg: "rgba(75, 160, 29, 0.1)", format: (v) => v?.toLocaleString("en-IN") || "0" },
  { key: "experience", label: "Experience", icon: <Icons.Clock size={15} />, accent: "#F75801", iconBg: "rgba(247, 88, 1, 0.1)", format: (v) => (v ? `${v} yrs` : "—") },
  { key: "followers", label: "Followers", icon: <Icons.User size={15} />, accent: "#F75801", iconBg: "rgba(247, 88, 1, 0.1)", format: (v) => v?.toLocaleString("en-IN") || "0" },
];

const QuickStatsSection = ({ astrologerData }) => {
  const values = {
    rating: astrologerData?.averageRating ?? astrologerData?.rating ?? 0,
    sessions: astrologerData?.totalSessions ?? astrologerData?.sessionCount ?? 0,
    experience: astrologerData?.experience ?? 0,
    followers: astrologerData?.followersCount ?? astrologerData?.followers ?? 0,
  };

  return (
    <div>
      <div className="flex mb-3">
        <SectionHeader title="QUICK STATS" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {statConfig.map((stat) => (
          <div
            key={stat.key}
            className="relative rounded-2xl p-3 sm:p-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group min-h-[112px]"
            style={{
              background: "var(--dashboard-surface)",
              boxShadow: "var(--dashboard-shadow-card)",
              border: "1px solid var(--dashboard-border)",
            }}
          >
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none" style={{ background: `${stat.accent}10` }} />
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105"
              style={{ background: stat.iconBg, color: stat.accent }}
            >
              {stat.icon}
            </div>
            <p className="text-lg sm:text-xl font-bold text-[var(--dashboard-text)] tracking-tight mb-0.5">
              {stat.format(values[stat.key])}
            </p>
            <p className="text-[11px] text-[var(--dashboard-muted)] font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStatsSection;
