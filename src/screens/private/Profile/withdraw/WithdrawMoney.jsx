import { useState } from "react";
import { Icons } from "../../../../components/Icons";
import { Link } from "react-router-dom";

const WithdrawMoney = () => {
  const [amount, setAmount] = useState("");
  const [withdrawalType, setWithdrawalType] = useState("instant"); // ✅ FIXED
  const [selectedAccount, setSelectedAccount] = useState("1");

  const accounts = [
    { id: "1", name: "Primary Bank Account", number: "•••• •••• •••• 2222" },
    { id: "2", name: "Secondary Bank Account", number: "•••• •••• •••• 3333" },
  ];

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Link to="/profile">
            <Icons.ChevronLeft size={20} className="text-gray-700" />
          </Link>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Withdraw Money</h1>
      </div>

      <div className="flex-1 space-y-8">
        {/* Amount Input */}
        <div className="text-center">
          <label className="text-sm text-gray-400 mb-2 block">
            Enter Amount
          </label>

          <div className="relative max-w-xs mx-auto">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="₹"
              className="w-full border border-gray-400 rounded-2xl py-4 text-center text-3xl font-bold text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-300"
            />
          </div>

          <p className="text-xs text-gray-500 mt-2 font-medium">
            Available Balance{" "}
            <span className="text-black font-bold">₹28,000</span>
          </p>
        </div>

        {/* Withdrawal Options */}
        <div className="space-y-3">
          {/* Instant Withdraw */}
          <label
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setWithdrawalType("instant")}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                withdrawalType === "instant"
                  ? "border-black"
                  : "border-gray-400"
              }`}
            >
              {withdrawalType === "instant" && (
                <div className="w-2 h-2 rounded-full bg-black"></div>
              )}
            </div>

            <span
              className={`text-xs ${
                withdrawalType === "instant"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              Instant Withdrawal{" "}
              <span className="font-bold">(Max. ₹20,000)</span>
            </span>
          </label>

          {/* Standard Withdraw */}
          <label
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setWithdrawalType("standard")}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                withdrawalType === "standard"
                  ? "border-black"
                  : "border-gray-400"
              }`}
            >
              {withdrawalType === "standard" && (
                <div className="w-2 h-2 rounded-full bg-black"></div>
              )}
            </div>

            <span
              className={`text-xs ${
                withdrawalType === "standard"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              24–48 hours for Withdrawal of{" "}
              <span className="font-bold">₹20,000 and more</span>
            </span>
          </label>
        </div>

        {/* Bank Accounts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              Withdraw Money to
            </h3>

            <button className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-800 transition-colors">
              <span className="text-sm leading-none">+</span> Add Beneficiary
              Account
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => setSelectedAccount(acc.id)}
                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedAccount === acc.id
                    ? "bg-[#EAEAEA]"
                    : "bg-[#EAEAEA]/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D9D9D9] rounded-md"></div>

                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {acc.name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {acc.number}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  {selectedAccount === acc.id ? (
                    <Icons.CheckCircle
                      size={24}
                      className="text-black fill-transparent"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Withdraw Button */}

      <div className="mt-auto pb-6 pt-4">
        <Link to="/profile">
          <button className="w-full bg-black text-white font-medium py-4 rounded-2xl hover:bg-gray-900 transition-colors">
            Withdraw Money
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WithdrawMoney;
