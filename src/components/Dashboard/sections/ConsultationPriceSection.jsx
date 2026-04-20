import { Link } from "react-router-dom";
import { Icons } from "../../Icons";

const ConsultationPriceSection = ({ astrologerData }) => {
  const chatRate = astrologerData?.price?.chatRate?.amount || 0;
  const callRate = astrologerData?.price?.audioRate?.amount || 0;
  const videoRate = astrologerData?.price?.videoCallRate?.amount || 0;

  const rates = [
    { label: "Chat", rate: chatRate, icon: <Icons.MessageSquare size={14} />, color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Call", rate: callRate, icon: <Icons.Phone size={14} />, color: "#4BA01D", bg: "#E8F5E9" },
    { label: "Video", rate: videoRate, icon: <Icons.Video size={14} />, color: "#F75801", bg: "#FFF0E6" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <div className="px-3 py-2.5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #FF9A44 0%, #FF7A2F 50%, #F75801 100%)" }}>
        <div>
          <h3 className="text-sm font-bold text-white">Consultation Price</h3>
          <p className="text-[10px] text-white/70 mt-0.5">Per minute rates</p>
        </div>
        <Link to="/set-your-consultation-price" className="bg-white text-[#F75801] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-0.5 hover:bg-[#FFF5EC] transition-all shadow-sm">
          Edit <Icons.ChevronRight size={11} />
        </Link>
      </div>

      <div className="p-3">
        <div className="flex gap-2">
          {rates.map((r) => (
            <div key={r.label} className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1" style={{ background: r.bg }}>
              <span style={{ color: r.color }}>{r.icon}</span>
              <p className="text-lg font-bold text-[#1A1A1A] leading-tight">₹{r.rate}</p>
              <p className="text-[9px] font-semibold text-[#6B7280] uppercase">{r.label}</p>
            </div>
          ))}
        </div>
        <p className="flex items-center gap-1 text-[10px] text-[#9CA3AF] mt-2">
          <Icons.Clock size={9} /> Rates are per minute
        </p>
      </div>
    </div>
  );
};

export default ConsultationPriceSection;
