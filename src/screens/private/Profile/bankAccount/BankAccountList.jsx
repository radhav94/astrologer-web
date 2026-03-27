import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import toast from "../../../../components/toast";
import {
  useGetBankAccountsQuery,
  useDeactivateBankAccountMutation,
  useActivateBankAccountMutation,
} from "../../../../redux/bankAccountApi/bankAccountApi";
import styles from "./BankAccount.module.scss";

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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <Icons.ChevronLeft size={20} />
        </button>
        <h1 className={styles.headerTitle}>Bank Accounts</h1>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {["active", "inactive"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`${styles.filterTab} ${statusFilter === status ? styles.filterTabActive : ""}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Add Account */}
      <div className={styles.addRow}>
        <Link to="/bank-accounts/add" className={styles.addLink}>
          <Icons.Plus size={14} /> Add Account
        </Link>
      </div>

      {/* Account List */}
      <div className={styles.listContent}>
        {isLoading || isFetching ? (
          <div className={styles.loadingCenter}>
            <div className={styles.spinner} />
          </div>
        ) : accounts.length === 0 ? (
          <div className={styles.emptyState}>
            <Icons.Wallet size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No {statusFilter} bank accounts found</p>
          </div>
        ) : (
          accounts.map((acc) => (
            <div key={acc._id} className={styles.accountCard}>
              <div className={styles.accountLeft}>
                <div className={styles.accountIcon}>
                  <Icons.Wallet size={18} />
                </div>
                <div className={styles.accountDetails}>
                  <div className={styles.accountNameRow}>
                    <p className={styles.accountName}>{acc.bankName || "Bank Account"}</p>
                    {acc.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
                  </div>
                  <p className={styles.accountMeta}>
                    {acc.accountHolderName} • {maskAccountNumber(acc.accountNumber)}
                  </p>
                  {acc.upiId && <p className={styles.accountUpi}>UPI: {acc.upiId}</p>}
                </div>
              </div>

              <div className={styles.accountActions}>
                <button
                  onClick={() => navigate(`/bank-accounts/edit/${acc._id}`, { state: { account: acc } })}
                  className={styles.editButton}
                  aria-label="Edit bank account"
                >
                  <Icons.Edit size={15} />
                </button>
                <button
                  onClick={() => handleToggleStatus(acc)}
                  disabled={isDeactivating || isActivating}
                  className={`${styles.toggleButton} ${statusFilter === "active" ? styles.deactivateBtn : styles.activateBtn}`}
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
