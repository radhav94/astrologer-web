import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Icons } from "../../Icons";
import { useGetOrderHistoryQuery } from "../../../redux/oderHistory/orderHistory";
import { AppDefaultImg } from "../../../utils/appImages";
import dayjs from "dayjs";

const typeColors = { call: "#4BA01D", chat: "#3B82F6", video: "#F75801" };

const OrderHistorySection = ({ dateFilter }) => {
  const { data, isLoading } = useGetOrderHistoryQuery({ page: 1, limit: 8, ...dateFilter }, { refetchOnMountOrArgChange: true });
  const orders = data?.data?.transactions || [];
  const total = data?.data?.pagination?.totalItems || 0;

  const chartData = useMemo(() =>
    orders.slice(0, 7).map((o, i) => ({
      name: dayjs(o.createdAt).format("hh:mm"),
      amount: o.billing?.astrologer?.creditAmount || o.sessionDetails?.amount || 0,
      color: typeColors[o.type] || "#9CA3AF",
    })).reverse(),
  [orders]);

  return (
    <div className="h-full">
      <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Card header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h4 className="text-sm font-bold text-[#1A1A1A]">Orders</h4>
          <Link to="/consultation-history" className="text-[10px] text-[#F75801] hover:text-[#D43400] font-semibold flex items-center gap-0.5 transition-colors">
            View All <Icons.ArrowRight size={10} />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-4 h-4 border-2 border-[#F75801] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Icons.FileText size={24} className="text-[#D1D5DB] mb-2" />
            <p className="text-[#6B7280] text-xs font-medium">No orders yet</p>
          </div>
        ) : (
          <>
            {/* Header stats */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{total}</p>
              </div>
              <div className="flex gap-3">
                {Object.entries(typeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[10px] text-[#9CA3AF] capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="px-2 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="25%">
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-white rounded-lg shadow-lg border border-[rgba(0,0,0,0.08)] px-2.5 py-1.5 text-[11px]">
                        <span className="font-bold text-[#1A1A1A]">₹{payload[0].value?.toLocaleString("en-IN")}</span>
                      </div>
                    ) : null}
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent list */}
            <div className="border-t border-[rgba(0,0,0,0.04)] divide-y divide-[rgba(0,0,0,0.04)] flex-1">
              {orders.slice(0, 3).map((o) => (
                <div key={o._id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#f8f9fa] transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-[rgba(0,0,0,0.06)]">
                    <img src={o.displayProfile?.profileImage || AppDefaultImg.DefaultMaleAstrologer} alt="" className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = AppDefaultImg.DefaultMaleAstrologer; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#1A1A1A] truncate">{o.displayProfile?.name || "User"}</p>
                    <span className="text-[10px] text-[#9CA3AF]">{dayjs(o.createdAt).format("DD MMM, hh:mm A")}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#4BA01D] flex-shrink-0">
                    +₹{(o.billing?.astrologer?.creditAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistorySection;
