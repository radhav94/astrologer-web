import { useMemo } from "react";
import { Icons } from "../../Icons";
import { useGetAllWalletsQuery } from "../../../redux/astrologer/astrologerApi";
import { useGetWithdrawalHistoryQuery } from "../../../redux/oderHistory/orderHistory";

const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

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
    { label: "Total Wallet Balance", value: formatCurrency(balance), icon: <Icons.Wallet size={20} />, color: "#4BA01D", gradient: "linear-gradient(135deg, #4BA01D 0%, #65C832 100%)" },
    { label: "Total Withdrawal", value: formatCurrency(totalWithdrawn), icon: <Icons.ArrowRight size={20} />, color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" },
    { label: "Pending Withdrawal", value: formatCurrency(pendingWithdrawal), icon: <Icons.Clock size={20} />, color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)" },
    { label: "Refund Adjustment", value: "₹0", icon: <Icons.RefreshCw size={20} />, color: "#F75801", gradient: "linear-gradient(135deg, #F75801 0%, #FF8F00 100%)" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className="relative rounded-2xl p-5 text-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group cursor-default"
          style={{ background: item.gradient, boxShadow: `0 4px 20px ${item.color}30` }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/[0.07] pointer-events-none" />

          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
            {item.icon}
          </div>

          {isLoading ? (
            <div className="w-20 h-7 bg-white/20 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold tracking-tight leading-none">{item.value}</p>
          )}

          <p className="text-sm font-medium text-white/70 mt-1.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default WalletStatsSection;
