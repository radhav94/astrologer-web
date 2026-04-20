import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Icons } from "../../Icons";
import { useGetTransactionListQuery } from "../../../redux/profileApi/profileApi";
import dayjs from "dayjs";

const TransactionHistorySection = ({ dateFilter }) => {
  const { data, isLoading } = useGetTransactionListQuery({ page: 1, limit: 10, ...dateFilter }, { refetchOnMountOrArgChange: true });
  const transactions = data?.data?.transactions || [];
  const total = data?.data?.pagination?.totalItems || 0;

  const totalCredit = useMemo(() =>
    transactions.reduce((s, tx) => s + (tx.billing?.astrologer?.creditAmount || tx.amount || 0), 0),
  [transactions]);

  // Build area chart — cumulative earnings over recent transactions
  const chartData = useMemo(() => {
    let cumulative = 0;
    return transactions.slice(0, 8).reverse().map((tx, i) => {
      cumulative += tx.billing?.astrologer?.creditAmount || tx.amount || 0;
      return {
        name: dayjs(tx.createdAt).format("hh:mm"),
        value: cumulative,
      };
    });
  }, [transactions]);

  return (
    <div className="h-full">
      <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Card header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h4 className="text-sm font-bold text-[#1A1A1A]">Transactions</h4>
          <Link to="/consultation-history" state={{ tab: "transactions" }} className="text-[10px] text-[#F75801] hover:text-[#D43400] font-semibold flex items-center gap-0.5 transition-colors">
            View All <Icons.ArrowRight size={10} />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Icons.FileText size={24} className="text-[#D1D5DB] mb-2" />
            <p className="text-[#6B7280] text-xs font-medium">No transactions yet</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 pt-4 pb-1 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{total}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#9CA3AF] font-medium">Earned</p>
                <p className="text-lg font-bold text-[#4BA01D]">₹{totalCredit.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Area chart */}
            <div className="px-2 h-[110px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="txnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-white rounded-lg shadow-lg border border-[rgba(0,0,0,0.08)] px-2.5 py-1.5 text-[11px]">
                        <span className="font-bold text-[#1A1A1A]">₹{payload[0].value?.toLocaleString("en-IN")}</span>
                      </div>
                    ) : null}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#txnGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent list */}
            <div className="border-t border-[rgba(0,0,0,0.04)] divide-y divide-[rgba(0,0,0,0.04)] flex-1">
              {transactions.slice(0, 3).map((tx) => {
                const amount = tx.billing?.astrologer?.creditAmount || tx.amount || 0;
                return (
                  <div key={tx._id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#f8f9fa] transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-[rgba(59,130,246,0.08)] flex items-center justify-center flex-shrink-0 text-[#3B82F6]">
                      <Icons.FileText size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#1A1A1A] truncate">{tx.message || tx.displayProfile?.name || "Transaction"}</p>
                      <span className="text-[10px] text-[#9CA3AF]">{dayjs(tx.createdAt).format("DD MMM, hh:mm A")}</span>
                    </div>
                    {amount > 0 && <p className="text-[11px] font-bold text-[#4BA01D] flex-shrink-0">+₹{amount.toLocaleString("en-IN")}</p>}
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

export default TransactionHistorySection;
