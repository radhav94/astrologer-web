import { useMemo } from "react";
import { Icons } from "../../Icons";
import { useGetAllWalletsQuery } from "../../../redux/astrologer/astrologerApi";
import { useGetWithdrawalHistoryQuery } from "../../../redux/oderHistory/orderHistory";

const formatCurrency = (val) => {
  if (!val && val !== 0) return "—";
  const num = Number(val);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const QuickActionsSection = ({ overviewData, isLoading }) => {
  const { data: walletData, isLoading: walletLoading } = useGetAllWalletsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: withdrawalData, isLoading: withdrawalLoading } = useGetWithdrawalHistoryQuery({ page: 1, limit: 100 }, { refetchOnMountOrArgChange: true });

  const balance = walletData?.data || 0;

  const { totalWithdrawn, pendingWithdrawal } = useMemo(() => {
    const records = withdrawalData?.data?.records || withdrawalData?.data || [];
    let total = 0;
    let pending = 0;
    if (Array.isArray(records)) {
      records.forEach((r) => {
        const amt = r.amount || 0;
        if (r.status === "completed" || r.status === "approved") total += amt;
        else if (r.status === "pending" || r.status === "processing") pending += amt;
      });
    }
    return { totalWithdrawn: total, pendingWithdrawal: pending };
  }, [withdrawalData]);

  const anyLoading = isLoading || walletLoading || withdrawalLoading;

  const stats = useMemo(() => {
    const categories = overviewData?.categories || [];
    const getAmount = (label) => categories.find((c) => c.label === label)?.amount || 0;

    return [
      { label: "Total Sessions", value: overviewData?.transactionCount ?? 0, format: (v) => v.toLocaleString("en-IN"), icon: <Icons.Phone size={18} />, iconBg: "#FFF0E6", iconColor: "#F75801" },
      { label: "Total Earnings", value: overviewData?.totalIncome ?? 0, format: formatCurrency, icon: <Icons.Wallet size={18} />, iconBg: "#FFF0E6", iconColor: "#F75801" },
      { label: "Call Revenue", value: getAmount("Call"), format: formatCurrency, icon: <Icons.Phone size={18} />, iconBg: "#E8F5E9", iconColor: "#4BA01D" },
      { label: "Chat Revenue", value: getAmount("Chat"), format: formatCurrency, icon: <Icons.MessageSquare size={18} />, iconBg: "#EFF6FF", iconColor: "#3B82F6" },
      { label: "Video Revenue", value: getAmount("Video"), format: formatCurrency, icon: <Icons.Video size={18} />, iconBg: "#FFF3E0", iconColor: "#F59E0B" },
      { label: "Gift Revenue", value: getAmount("Gifts"), format: formatCurrency, icon: <Icons.Gift size={18} />, iconBg: "#FFF0E6", iconColor: "#F75801" },
      { label: "Available Balance", value: balance, format: formatCurrency, icon: <Icons.Wallet size={18} />, iconBg: "#E8F5E9", iconColor: "#4BA01D" },
      { label: "Withdrawn Amount", value: totalWithdrawn, format: formatCurrency, icon: <Icons.ArrowRight size={18} />, iconBg: "#EFF6FF", iconColor: "#3B82F6" },
      { label: "Pending Clearance", value: pendingWithdrawal, format: formatCurrency, icon: <Icons.Clock size={18} />, iconBg: "#FFF3E0", iconColor: "#F59E0B" },
      { label: "Refund Adjustment", value: 0, format: formatCurrency, icon: <Icons.RefreshCw size={18} />, iconBg: "#FFF0E6", iconColor: "#F75801" },
    ];
  }, [overviewData, balance, totalWithdrawn, pendingWithdrawal]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: item.iconBg, color: item.iconColor }}
          >
            {item.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#6B7280] font-medium mb-0.5">{item.label}</p>
            {anyLoading ? (
              <div className="w-14 h-6 bg-[#f3f4f6] rounded animate-pulse" />
            ) : (
              <p className="text-xl font-bold text-[#1A1A1A] tracking-tight">{item.format(item.value)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActionsSection;
