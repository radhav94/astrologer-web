import { useState } from "react";
import { Icons } from "../../../../components/Icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetBankAccountsQuery } from "../../../../redux/bankAccountApi/bankAccountApi";

// Bank logo color map for visual distinction
const BANK_COLORS = {
  hdfc: { bg: "#EBF0F9", text: "#004B87" },
  icici: { bg: "#FFF3E6", text: "#F58220" },
  sbi: { bg: "#E8F0FE", text: "#1A5DAD" },
  axis: { bg: "#FDEAEF", text: "#97144D" },
  pnb: { bg: "#FFF3E6", text: "#D4213D" },
  kotak: { bg: "#FFF3E6", text: "#ED1C24" },
  bob: { bg: "#FFF0E6", text: "#F47920" },
  idfc: { bg: "#EBF5F0", text: "#9C1D26" },
  default: { bg: "#F3F4F6", text: "#6B7280" },
};

const getBankStyle = (bankName) => {
  if (!bankName) return BANK_COLORS.default;
  const lower = bankName.toLowerCase();
  const match = Object.keys(BANK_COLORS).find((key) => lower.includes(key));
  return BANK_COLORS[match] || BANK_COLORS.default;
};

const getBankInitials = (bankName) => {
  if (!bankName) return "B";
  return bankName
    .split(" ")
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const maskAccountNumber = (num) => {
  if (!num || num.length < 4) return num || "";
  return "•••• •••• •••• " + num.slice(-4);
};

const WithdrawMoney = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [withdrawalType, setWithdrawalType] = useState("instant");
  const [selectedAccount, setSelectedAccount] = useState(null);

  const astrologerDetails = useSelector((state) => state.register?.astrologerDetails);
  const walletBalance = astrologerDetails?.wallet || 0;

  const { data, isLoading } = useGetBankAccountsQuery("active");
  const accounts = data?.data || [];

  // Auto-select primary account
  useState(() => {
    const primary = accounts.find((a) => a.isPrimary);
    if (primary) setSelectedAccount(primary._id);
  }, [accounts]);

  const formatAmount = (val) => {
    const num = val.replace(/[^0-9]/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("en-IN");
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  };

  const displayAmount = amount ? `₹${formatAmount(amount)}` : "";

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto px-1">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ backgroundColor: "#F26B2B" }}
          aria-label="Go back"
        >
          <Icons.ChevronLeft size={18} className="text-white" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">Withdraw Money</h1>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Enter Amount */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Enter Amount</p>
          <div className="border border-gray-300 rounded-xl px-4 py-5 flex items-center justify-center">
            <input
              type="text"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="₹"
              className="w-full text-center text-3xl font-bold text-gray-800 focus:outline-none placeholder-gray-300 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-gray-500">Available Balance</p>
            <p className="text-xs font-bold text-gray-900">₹{walletBalance.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Withdrawal Type */}
        <div className="space-y-2.5">
          <label
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setWithdrawalType("instant")}
          >
            <div className="mt-0.5">
              <div
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                  withdrawalType === "instant" ? "border-[#F26B2B]" : "border-gray-300"
                }`}
              >
                {withdrawalType === "instant" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#F26B2B]" />
                )}
              </div>
            </div>
            <span className="text-xs text-gray-700 leading-relaxed">
              Instant Withdrawal <span className="font-bold">(Max. ₹20,000)</span>
            </span>
          </label>

          <label
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setWithdrawalType("standard")}
          >
            <div className="mt-0.5">
              <div
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                  withdrawalType === "standard" ? "border-[#F26B2B]" : "border-gray-300"
                }`}
              >
                {withdrawalType === "standard" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#F26B2B]" />
                )}
              </div>
            </div>
            <span className="text-xs text-gray-700 leading-relaxed">
              24-48 hours for Withdrawal of <span className="font-bold">₹20,000 and more</span>
            </span>
          </label>
        </div>

        {/* Withdraw Money to */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">Withdraw Money to</p>
            <Link
              to="/bank-accounts/add"
              className="flex items-center gap-1 text-[11px] font-semibold text-white px-3 py-1.5 rounded-md"
              style={{ backgroundColor: "#F26B2B" }}
            >
              <Icons.Plus size={12} /> Add Account
            </Link>
          </div>

          <div className="space-y-2.5">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-[3px] border-[#F26B2B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400">No bank accounts added yet</p>
                <Link
                  to="/bank-accounts/add"
                  className="text-xs font-medium mt-2 inline-block"
                  style={{ color: "#F26B2B" }}
                >
                  + Add your first account
                </Link>
              </div>
            ) : (
              accounts.map((acc) => {
                const bankStyle = getBankStyle(acc.bankName);
                const isSelected = selectedAccount === acc._id;
                return (
                  <div
                    key={acc._id}
                    onClick={() => setSelectedAccount(acc._id)}
                    className={`px-3 py-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? "bg-[#FFF5F0] ring-1 ring-[#F26B2B]/30" : "bg-[#F5F5F5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Bank Logo */}
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: bankStyle.bg, color: bankStyle.text }}
                      >
                        {getBankInitials(acc.bankName)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">
                          {acc.isPrimary ? "Primary Bank Account" : acc.bankName || "Bank Account"}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {maskAccountNumber(acc.accountNumber)}
                        </p>
                      </div>
                    </div>

                    {/* Radio */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#F26B2B]" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-[10px] h-[10px] rounded-full bg-[#F26B2B]" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <div className="pt-4 pb-6">
        <button
          className="w-full text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
          style={{ backgroundColor: "#F26B2B" }}
          disabled={!amount || !selectedAccount}
        >
          Withdraw Money
          <Icons.ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default WithdrawMoney;
