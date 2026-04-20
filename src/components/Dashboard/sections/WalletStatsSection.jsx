import { useMemo } from "react";
import { Icons } from "../../Icons";
import { useGetAllWalletsQuery } from "../../../redux/astrologer/astrologerApi";
import { useGetWithdrawalHistoryQuery } from "../../../redux/oderHistory/orderHistory";

const formatCurrency = (val) => {
  const num = Number(val || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const WalletStatsSection = () => {
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

  const isLoading = walletLoading || withdrawalLoading;

  const stats = [
    { label: "Available Balance", sublabel: "Ready to withdraw", value: formatCurrency(balance), icon: <Icons.Wallet size={20} />, iconBg: "#E8F5E9", iconColor: "#4BA01D" },
    { label: "Withdrawn Amount", sublabel: "Last 30 days", value: formatCurrency(totalWithdrawn), icon: <Icons.ArrowRight size={20} />, iconBg: "#EFF6FF", iconColor: "#3B82F6" },
    { label: "Pending Clearance", sublabel: "Clears in 24-48h", value: formatCurrency(pendingWithdrawal), icon: <Icons.Clock size={20} />, iconBg: "#FFF3E0", iconColor: "#F59E0B" },
    { label: "Refund Adjustment", sublabel: "Total adjustments", value: "₹0", icon: <Icons.RefreshCw size={20} />, iconBg: "#FFF0E6", iconColor: "#F75801" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            <p className="text-xs text-[#6B7280] font-medium">{item.label}</p>
            {isLoading ? (
              <div className="w-20 h-7 bg-[#f3f4f6] rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-2xl font-bold text-[#1A1A1A] tracking-tight mt-0.5">{item.value}</p>
            )}
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletStatsSection;
