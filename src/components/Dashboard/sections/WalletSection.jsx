import { Link } from "react-router-dom";
import { Icons } from "../../Icons";
import SectionHeader from "../../UI/SectionHeader";
import { useGetAllWalletsQuery } from "../../../redux/astrologer/astrologerApi";

const WalletSection = () => {
  const { data: walletData, isLoading } = useGetAllWalletsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // API returns balance directly as walletData.data (a number), same as Profile page
  const balance = walletData?.data || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionHeader title="WALLET" />
        <Link
          to="/profile"
          state={{ data: "withdrawals" }}
          className="text-sm text-[#F75801] hover:text-[#D43400] font-semibold flex items-center gap-1 transition-colors"
        >
          View History <Icons.ArrowRight size={16} />
        </Link>
      </div>

      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{
          background: "#ffffff",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[rgba(247,88,1,0.04)] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[rgba(255,192,99,0.04)] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-black/[0.01] pointer-events-none" />
        <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-[var(--dashboard-success)] animate-pulse" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between mb-7">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[rgba(247,88,1,0.12)] flex items-center justify-center border border-[rgba(0,0,0,0.04)]">
                  <Icons.Wallet size={17} className="text-[#F75801]" />
                </div>
                <p className="text-[#6B7280] text-sm font-medium">Available Balance</p>
              </div>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] tracking-tight mt-2">
                {isLoading ? (
                  <span className="inline-block w-32 h-10 bg-black/5 rounded-lg animate-pulse" />
                ) : (
                  `₹${typeof balance === "number" ? balance.toLocaleString("en-IN") : balance}`
                )}
              </h3>
            </div>

            <Link
              to="/withdraw-money"
              className={`bg-[var(--dashboard-accent)] text-white px-6 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 hover:bg-[var(--dashboard-accent-strong)] ${balance === 0 ? "opacity-50 pointer-events-none" : ""}`}
              style={{ boxShadow: "0 6px 20px rgba(247, 88, 1, 0.25)" }}
            >
              Withdraw <Icons.ArrowRight size={16} />
            </Link>
          </div>

          {/* Bottom stat */}
          <div className="flex items-center gap-6 pt-4 border-t border-black/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--dashboard-success)]" />
              <p className="text-[#6B7280] text-xs sm:text-sm font-medium">
                Wallet linked
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSection;
