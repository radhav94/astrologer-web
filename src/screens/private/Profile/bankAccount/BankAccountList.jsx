import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import toast from "../../../../components/toast";
import {
  useGetBankAccountsQuery,
  useDeactivateBankAccountMutation,
  useActivateBankAccountMutation,
} from "../../../../redux/bankAccountApi/bankAccountApi";

const BankAccountList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("active");

  const { data, isLoading, isFetching } = useGetBankAccountsQuery(statusFilter);
  const [deactivateBankAccount, { isLoading: isDeactivating }] = useDeactivateBankAccountMutation();
  const [activateBankAccount, { isLoading: isActivating }] = useActivateBankAccountMutation();

  const accounts = data?.data || [];

  const handleToggleStatus = async (account) => {
    try {
      if (statusFilter === "active") {
        await deactivateBankAccount(account._id).unwrap();
        toast.success("Bank account deactivated");
      } else {
        await activateBankAccount({ accountId: account._id, activate: true }).unwrap();
        toast.success("Bank account activated");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const maskAccountNumber = (num) => {
    if (!num || num.length < 4) return num;
    return "•••• •••• " + num.slice(-4);
  };

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          onClick={() => navigate(-1)}
        >
          <Icons.ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Bank Accounts</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {["active", "inactive"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              statusFilter === status
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Add Account Button */}
      <div className="flex justify-end mb-4">
        <Link
          to="/bank-accounts/add"
          className="bg-orange-500 text-white text-xs px-4 py-2 rounded-full flex items-center gap-1 hover:bg-orange-600 transition-colors"
        >
          <Icons.Plus size={14} /> Add Account
        </Link>
      </div>

      {/* Account List */}
      <div className="flex-1 space-y-3">
        {isLoading || isFetching ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <Icons.Wallet size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No {statusFilter} bank accounts found</p>
          </div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc._id}
              className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <Icons.Wallet size={18} className="text-orange-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {acc.bankName || "Bank Account"}
                    </p>
                    {acc.isPrimary && (
                      <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {acc.accountHolderName} • {maskAccountNumber(acc.accountNumber)}
                  </p>
                  {acc.upiId && (
                    <p className="text-[10px] text-gray-400">UPI: {acc.upiId}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {/* Edit */}
                <button
                  onClick={() => navigate(`/bank-accounts/edit/${acc._id}`, { state: { account: acc } })}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Edit bank account"
                >
                  <Icons.Edit size={15} className="text-gray-500" />
                </button>

                {/* Toggle Active/Inactive */}
                <button
                  onClick={() => handleToggleStatus(acc)}
                  disabled={isDeactivating || isActivating}
                  className={`text-[10px] px-3 py-1 rounded-full font-medium transition-colors ${
                    statusFilter === "active"
                      ? "bg-red-50 text-red-500 hover:bg-red-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                  aria-label={statusFilter === "active" ? "Deactivate account" : "Activate account"}
                >
                  {statusFilter === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BankAccountList;
