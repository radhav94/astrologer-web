import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Icons } from "../../Icons";
import SectionHeader from "../../UI/SectionHeader";
import { useGetRecentAstrologerActivitiesQuery } from "../../../redux/recentActivities/recentActivities";

const typeColors = {
  call_billing: "#4BA01D",
  chat_billing: "#3B82F6",
  video_billing: "#F75801",
  gift: "#D7A24F",
};

const typeLabels = {
  call_billing: "Call",
  chat_billing: "Chat",
  video_billing: "Video",
  gift: "Gift",
};

const typeIcons = {
  call_billing: <Icons.Phone size={12} />,
  chat_billing: <Icons.MessageSquare size={12} />,
  video_billing: <Icons.Video size={12} />,
  gift: <Icons.Gift size={12} />,
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now - d) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (Math.floor(diffHrs / 24) === 1) return "Yesterday";
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const RecentActivitySection = () => {
  const { data, isLoading } = useGetRecentAstrologerActivitiesQuery({ page: 1, limit: 10 });
  const activities = useMemo(() =>
    (data?.data?.records || []).flatMap((g) => g.transactions || []).slice(0, 8),
  [data]);

  // Line chart — cumulative earnings per type over time
  const chartData = useMemo(() => {
    const cumulative = { call: 0, chat: 0, other: 0 };
    return activities.slice().reverse().map((tx) => {
      const amt = tx.amount || 0;
      const reason = tx.reason || "";
      if (reason === "call_billing" || reason === "video_billing") cumulative.call += amt;
      else if (reason === "chat_billing") cumulative.chat += amt;
      else cumulative.other += amt;

      const d = new Date(tx.createdAt);
      return {
        time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        Call: cumulative.call,
        Chat: cumulative.chat,
        Other: cumulative.other,
      };
    });
  }, [activities]);

  // Summary by type
  const summary = useMemo(() => {
    const map = {};
    activities.forEach((tx) => {
      const key = tx.reason || "other";
      if (!map[key]) map[key] = { count: 0, total: 0 };
      map[key].count++;
      map[key].total += tx.amount || 0;
    });
    return Object.entries(map).map(([key, val]) => ({
      key,
      label: typeLabels[key] || "Other",
      color: typeColors[key] || "#9CA3AF",
      icon: typeIcons[key] || <Icons.Clock size={12} />,
      ...val,
    }));
  }, [activities]);

  const totalEarned = activities.reduce((s, tx) => s + (tx.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="RECENT ACTIVITY" />
        <Link to="/recent-activity" className="text-xs text-[#F75801] hover:text-[#D43400] font-semibold flex items-center gap-1 transition-colors">
          View All <Icons.ArrowRight size={14} />
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-4 h-4 border-2 border-[#F75801] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#6B7280] text-sm ml-2">Loading...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-[#f8f9fa] flex items-center justify-center mb-3">
              <Icons.Clock size={20} className="text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] text-sm font-medium">No activity yet</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5">Your recent sessions will appear here</p>
          </div>
        ) : (
          <>
            {/* Summary chips + total */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {summary.map((s) => (
                  <div key={s.key} className="flex items-center gap-1.5 bg-[#f8f9fa] rounded-lg px-2.5 py-1.5 border border-[rgba(0,0,0,0.04)]">
                    <span style={{ color: s.color }}>{s.icon}</span>
                    <span className="text-[11px] font-semibold text-[#1A1A1A]">{s.count}</span>
                    <span className="text-[10px] text-[#9CA3AF]">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#9CA3AF] font-medium">Total Earned</p>
                <p className="text-lg font-bold text-[#1A1A1A]">₹{totalEarned.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Multi-line chart: Call, Chat, Gift */}
            <div className="px-2 sm:px-3 h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={35} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    content={({ active, payload, label }) => active && payload?.length ? (
                      <div className="bg-white rounded-lg shadow-lg border border-[rgba(0,0,0,0.08)] px-3 py-2 text-[11px]">
                        <p className="text-[#9CA3AF] text-[10px] mb-1">{label}</p>
                        {payload.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                            <span className="text-[#6B7280]">{p.name}</span>
                            <span className="font-bold text-[#1A1A1A] ml-auto">₹{p.value?.toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                  />
                  <Line type="monotone" dataKey="Call" stroke="#4BA01D" strokeWidth={2} dot={{ r: 2.5, fill: "#4BA01D", strokeWidth: 0 }} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="Chat" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2.5, fill: "#3B82F6", strokeWidth: 0 }} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="Other" stroke="#F75801" strokeWidth={2} dot={{ r: 2.5, fill: "#F75801", strokeWidth: 0 }} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent list */}
            <div className="border-t border-[rgba(0,0,0,0.04)] px-4 sm:px-5 py-3">
              <div className="space-y-1.5">
                {activities.slice(0, 4).map((tx, idx) => {
                  const color = typeColors[tx.reason] || "#9CA3AF";
                  const label = typeLabels[tx.reason] || "Other";
                  return (
                    <div key={tx._id || idx} className="flex items-center gap-2.5 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <p className="text-[12px] font-medium text-[#1A1A1A] truncate flex-1">{tx.message || `${label} session`}</p>
                      <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">{formatTime(tx.createdAt)}</span>
                      {tx.amount > 0 && (
                        <span className="text-[11px] font-bold text-[#4BA01D] flex-shrink-0">+₹{tx.amount.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentActivitySection;
