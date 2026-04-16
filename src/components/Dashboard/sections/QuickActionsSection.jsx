import { useMemo } from "react";
import { Icons } from "../../Icons";

const formatCurrency = (val) => {
  if (!val && val !== 0) return "—";
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

const QuickActionsSection = ({ overviewData, isLoading }) => {
  const stats = useMemo(() => {
    const categories = overviewData?.categories || [];
    const getAmount = (label) => categories.find((c) => c.label === label)?.amount || 0;

    return [
      { label: "Total Sessions", value: overviewData?.transactionCount ?? 0, format: (v) => v.toLocaleString("en-IN"), icon: <Icons.Phone size={18} />, color: "#F75801", bg: "linear-gradient(135deg, #FFF0E6 0%, #FFE0CC 100%)", iconBg: "linear-gradient(135deg, #F75801 0%, #FF8F00 100%)" },
      { label: "Total Revenue", value: overviewData?.totalIncome ?? 0, format: formatCurrency, icon: <Icons.Wallet size={18} />, color: "#4BA01D", bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", iconBg: "linear-gradient(135deg, #4BA01D 0%, #65C832 100%)" },
      { label: "Call Revenue", value: getAmount("Call"), format: formatCurrency, icon: <Icons.Phone size={18} />, color: "#3B82F6", bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", iconBg: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" },
      { label: "Chat Revenue", value: getAmount("Chat"), format: formatCurrency, icon: <Icons.MessageSquare size={18} />, color: "#8B5CF6", bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)", iconBg: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)" },
      { label: "Video Revenue", value: getAmount("Video"), format: formatCurrency, icon: <Icons.Video size={18} />, color: "#F75801", bg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)", iconBg: "linear-gradient(135deg, #F75801 0%, #FF8F00 100%)" },
      { label: "Gift Revenue", value: getAmount("Gifts"), format: formatCurrency, icon: <Icons.Gift size={18} />, color: "#D7A24F", bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)", iconBg: "linear-gradient(135deg, #D7A24F 0%, #F0D38E 100%)" },
    ];
  }, [overviewData]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 h-full">
      {stats.map((item) => (
        <div
          key={item.label}
          className="group relative flex flex-col items-start justify-between rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          style={{ background: item.bg, border: `1px solid ${item.color}18` }}
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.07] pointer-events-none" style={{ background: item.color }} />

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
            style={{ background: item.iconBg }}
          >
            {item.icon}
          </div>

          <div className="mt-3">
            {isLoading ? (
              <div className="w-16 h-5 bg-black/5 rounded animate-pulse" />
            ) : (
              <p className="text-lg font-bold text-[#1A1A1A] leading-tight">{item.format(item.value)}</p>
            )}
            <p className="text-[11px] text-[#6B7280] mt-0.5">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActionsSection;
