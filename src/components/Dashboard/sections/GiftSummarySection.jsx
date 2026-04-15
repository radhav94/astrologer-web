import { Link } from "react-router-dom";
import { Icons } from "../../Icons";
import { useGetGiftReceivedListQuery } from "../../../redux/profileApi/profileApi";

const GiftSummarySection = () => {
  const { data, isLoading } = useGetGiftReceivedListQuery({ page: 1, limit: 5 });
  const gifts = data?.data?.transactions || data?.data || [];
  const pagination = data?.data?.pagination || data?.pagination || {};
  const totalGifts = pagination?.totalItems ?? gifts.length;
  const totalEarnings = gifts.reduce((sum, g) => sum + (g?.billing?.astrologer?.creditAmount || g?.amount || 0), 0);

  return (
    <div
      className="relative rounded-2xl overflow-hidden h-full"
      style={{
        background: "linear-gradient(145deg, #FFF7F0 0%, #FFFFFF 100%)",
        boxShadow: "var(--dashboard-shadow-card)",
        border: "1px solid var(--dashboard-border)",
      }}
    >
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[rgba(247,88,1,0.05)] pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <span className="text-[#9CA3AF] text-xs">Loading...</span>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[rgba(247,88,1,0.1)] flex items-center justify-center border border-[rgba(0,0,0,0.04)]">
                  <Icons.Gift size={16} className="text-[#F75801]" />
                </div>
                <p className="text-[#6B7280] text-xs font-medium">Gifts Received</p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">{totalGifts}</p>
                  <p className="text-[11px] text-[#9CA3AF] font-medium">Total</p>
                </div>
                <div className="w-px h-8 bg-[rgba(0,0,0,0.08)]" />
                <div>
                  <p className="text-lg sm:text-xl font-bold text-[#F75801] tracking-tight">
                    ₹{totalEarnings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] font-medium">Earned</p>
                </div>
              </div>
            </div>

            <Link
              to="/consultation-history"
              state={{ tab: "gifts" }}
              className="mt-3 text-xs font-semibold text-[#F75801] flex items-center gap-1 hover:text-[#D43400] transition-colors"
            >
              View All <Icons.ArrowRight size={14} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default GiftSummarySection;
