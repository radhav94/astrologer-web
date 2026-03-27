import { useState } from "react";
import { Icons } from "../../../../components/Icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetBankAccountsQuery, useWithdrawRequestMutation } from "../../../../redux/bankAccountApi/bankAccountApi";
import { useGetAllWalletsQuery } from "../../../../redux/astrologer/astrologerApi";
import { Toast } from "../../../../components";
import styles from "./WithdrawMoney.module.scss";

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

  const { data: walletResponse } = useGetAllWalletsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const walletBalance = walletResponse?.data ?? astrologerDetails?.wallet ?? 0;

  const [withdrawRequest, { isLoading: isWithdrawing }] = useWithdrawRequestMutation();

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

  const handleWithdraw = async () => {
    const selectedAcc = accounts.find((a) => a._id === selectedAccount);
    if (!selectedAcc || !amount || Number(amount) <= 0 || Number(amount) > walletBalance) return;
    try {
      const res = await withdrawRequest({
        requested_amount: Number(amount),
        bank_detail: {
          account_number: selectedAcc.accountNumber,
          ifsc_code: selectedAcc.ifscCode,
          account_holder_name: selectedAcc.accountHolderName,
          bank_name: selectedAcc.bankName,
          branch_name: selectedAcc.branchName || "",
          account_type: selectedAcc.accountType || "savings",
        },
        remarks: withdrawalType === "instant" ? "Instant withdrawal" : "Standard withdrawal",
      }).unwrap();

      if (res?.success) {
        Toast.success(res?.message || "Withdrawal request submitted");
        navigate(-1);
      } else {
        Toast.error(res?.message || "Withdrawal failed");
      }
    } catch (err) {
      Toast.error(err?.data?.message || "Withdrawal request failed");
    }
  };

  const displayAmount = amount ? `₹${formatAmount(amount)}` : "";

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton} aria-label="Go back">
          <Icons.ChevronLeft size={18} />
        </button>
        <h1 className={styles.headerTitle}>Withdraw Money</h1>
      </div>

      <div className={styles.content}>
        {/* Enter Amount */}
        <div>
          <p className={styles.sectionLabel}>Enter Amount</p>
          <div className={styles.amountBox}>
            <input
              type="text"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="₹"
              className={styles.amountInput}
            />
          </div>
          <div className={styles.balanceRow}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <p className={styles.balanceValue}>₹{walletBalance.toLocaleString("en-IN")}</p>
          </div>
          {amount && Number(amount) > walletBalance && (
            <p className={styles.errorText}>Amount exceeds available balance</p>
          )}
          {amount && Number(amount) <= 0 && (
            <p className={styles.errorText}>Please enter a valid amount</p>
          )}
        </div>

        {/* Withdrawal Type */}
          {/* <div className={styles.typeGroup}>
            <label className={styles.typeLabel} onClick={() => setWithdrawalType("instant")}>
              <div className={`${styles.radioOuter} ${withdrawalType === "instant" ? styles.radioOuterActive : ""}`}>
                {withdrawalType === "instant" && <div className={styles.radioInner} />}
              </div>
              <span className={styles.typeText}>
                Instant Withdrawal <span className={styles.typeBold}>(Max. ₹20,000)</span>
              </span>
            </label>

            <label className={styles.typeLabel} onClick={() => setWithdrawalType("standard")}>
              <div className={`${styles.radioOuter} ${withdrawalType === "standard" ? styles.radioOuterActive : ""}`}>
                {withdrawalType === "standard" && <div className={styles.radioInner} />}
              </div>
              <span className={styles.typeText}>
                24-48 hours for Withdrawal of <span className={styles.typeBold}>₹20,000 and more</span>
              </span>
            </label>
          </div> */}

        {/* Withdraw Money to */}
        <div className={styles.accountContainer}>
          <div className={styles.accountHeader}>
            <p className={styles.sectionLabel}>Withdraw Money to</p>
            <Link to="/bank-accounts/add" className={styles.addAccountLink}>
              <Icons.Plus size={12} /> Add Account
            </Link>
          </div>

          <div className={styles.accountList}>
            {isLoading ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner} />
              </div>
            ) : accounts.length === 0 ? (
              <div className={styles.emptyAccounts}>
                <p className={styles.emptyText}>No bank accounts added yet</p>
                <Link to="/bank-accounts/add" className={styles.emptyLink}>
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
                    className={`${styles.accountCard} ${isSelected ? styles.accountCardSelected : ""}`}
                  >
                    <div className={styles.accountInfo}>
                      <div
                        className={styles.bankLogo}
                        style={{ backgroundColor: bankStyle.bg, color: bankStyle.text }}
                      >
                        {getBankInitials(acc.bankName)}
                      </div>
                      <div>
                        <p className={styles.bankName}>
                          {acc.isPrimary ? "Primary Bank Account" : acc.bankName || "Bank Account"}
                        </p>
                        <p className={styles.bankAccount}>
                          {maskAccountNumber(acc.accountNumber)}
                        </p>
                      </div>
                    </div>

                    <div className={`${styles.accountRadio} ${isSelected ? styles.accountRadioActive : ""}`}>
                      {isSelected && <div className={styles.accountRadioInner} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <div className={styles.footer}>
        <button
          className={styles.withdrawButton}
          disabled={!amount || !selectedAccount || Number(amount) <= 0 || Number(amount) > walletBalance || isWithdrawing}
          onClick={handleWithdraw}
        >
          {isWithdrawing ? "Processing..." : "Withdraw Money"}
          {!isWithdrawing && <Icons.ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default WithdrawMoney;
