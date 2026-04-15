import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Icons } from "../../Icons";
import { useGetGiftReceivedListQuery } from "../../../redux/profileApi/profileApi";
import { AppDefaultImg } from "../../../utils/appImages";
import dayjs from "dayjs";

const COLORS = ["#D7A24F", "#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A"];

const GiftReceivedSection = () => {
  const { data, isLoading } = useGetGiftReceivedListQuery({ page: 1, limit: 10 }, { refetchOnMountOrArgChange: true });
  const gifts = data?.data?.transactions || [];
  const total = data?.data?.pagination?.totalItems || 0;

  const totalEarned = useMemo(() =>
    gifts.reduce((s, g) => s + (g.billing?.astrologer?.creditAmount || g.amount || 0), 0),
  [gifts]);

  // Group gifts by sender for donut
  const donutData = useMemo(() => {
    const map = {};
    gifts.forEach((g) => {
      const name = g.displayProfile?.name || "Anonymous";
      if (!map[name]) map[name] = 0;
      map[name] += g.billing?.astrologer?.creditAmount || g.amount || 0;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));
  }, [gifts]);

  return (
    <div className="h-full">
      <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Card header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h4 className="text-sm font-bold text-[#1A1A1A]">Gifts Received</h4>
          <Link to="/consultation-history" state={{ tab: "gifts" }} className="text-[10px] text-[#F75801] hover:text-[#D43400] font-semibold flex items-center gap-0.5 transition-colors">
            View All <Icons.ArrowRight size={10} />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-4 h-4 border-2 border-[#D7A24F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Icons.Gift size={24} className="text-[#D1D5DB] mb-2" />
            <p className="text-[#6B7280] text-xs font-medium">No gifts received yet</p>
          </div>
        ) : (
          <>
            {/* Header + mini donut */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-[#9CA3AF] font-medium">Total Gifts</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{total}</p>
                <p className="text-sm font-bold text-[#D7A24F] mt-0.5">₹{totalEarned.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-[#9CA3AF]">earned from gifts</p>
              </div>

              {donutData.length > 0 && (
                <div className="w-[100px] h-[100px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={3} dataKey="value" stroke="none">
                        {donutData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => active && payload?.length ? (
                          <div className="bg-white rounded-lg shadow-lg border border-[rgba(0,0,0,0.08)] px-2.5 py-1.5 text-[11px]">
                            <p className="font-semibold text-[#1A1A1A]">{payload[0].name}</p>
                            <p className="text-[#D7A24F] font-bold">₹{payload[0].value?.toLocaleString("en-IN")}</p>
                          </div>
                        ) : null}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Legend */}
            {donutData.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-x-3 gap-y-1">
                {donutData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                    <span className="text-[#6B7280] truncate max-w-[60px]">{d.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent list */}
            <div className="border-t border-[rgba(0,0,0,0.04)] divide-y divide-[rgba(0,0,0,0.04)] flex-1">
              {gifts.slice(0, 3).map((g) => {
                const amount = g.billing?.astrologer?.creditAmount || g.amount || 0;
                const name = g.displayProfile?.name || "Anonymous";
                const avatar = g.displayProfile?.profileImage;
                return (
                  <div key={g._id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#f8f9fa] transition-colors">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-[rgba(0,0,0,0.06)]">
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.src = AppDefaultImg.DefaultMaleAstrologer; }} />
                      ) : (
                        <div className="w-full h-full bg-[rgba(215,162,79,0.1)] flex items-center justify-center">
                          <Icons.Gift size={12} className="text-[#D7A24F]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#1A1A1A] truncate">{name}</p>
                      <span className="text-[10px] text-[#9CA3AF]">{dayjs(g.createdAt).format("DD MMM, hh:mm A")}</span>
                    </div>
                    {amount > 0 && <p className="text-[11px] font-bold text-[#D7A24F] flex-shrink-0">+₹{amount.toLocaleString("en-IN")}</p>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GiftReceivedSection;
