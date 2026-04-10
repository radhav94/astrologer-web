import { useState } from "react";
import { Icons } from "../../../../components/Icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetBankAccountsQuery, useDeactivateBankAccountMutation } from "../../../../redux/bankAccountApi/bankAccountApi";
import { useGetAllWalletsQuery } from "../../../../redux/astrologer/astrologerApi";
import { Toast } from "../../../../components";
import { AppDefaultImg } from "../../../../utils/appImages";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Button from "../../../../components/UI/button/Button";
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
  const [openMenuId, setOpenMenuId] = useState(null);

  const astrologerDetails = useSelector((state) => state.register?.astrologerDetails);

  const { data: walletResponse } = useGetAllWalletsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const walletBalance = walletResponse?.data ?? astrologerDetails?.wallet ?? 0;

  const [deactivateBankAccount] = useDeactivateBankAccountMutation();

  const { data, isLoading } = useGetBankAccountsQuery();
  const accounts = [...(data?.data || [])].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  // Auto-select primary account (only if approved)
  useState(() => {
    const primary = accounts.find((a) => a.isPrimary && a.verificationStatus !== "pending");
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

  const handleWithdraw = () => {
    const selectedAcc = accounts.find((a) => a._id === selectedAccount);
    if (!selectedAcc || !amount || Number(amount) <= 0 || Number(amount) > walletBalance) return;
    navigate("/confirm-withdrawal", {
      state: {
        amount: Number(amount),
        withdrawalType,
        account: selectedAcc,
      },
    });
  };

  const handleDeleteAccount = async (accId) => {
    try {
      await deactivateBankAccount(accId).unwrap();
      Toast.success("Bank account removed");
      setOpenMenuId(null);
      if (selectedAccount === accId) setSelectedAccount(null);
    } catch (err) {
      Toast.error(err?.data?.message || "Failed to remove account");
    }
  };

  const displayAmount = amount ? `₹${formatAmount(amount)}` : "";

  return (
    <div className={styles.container}>
      {/* Header */}
      <SectionHeader title="Withdraw Money" />

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
          <div className={styles.typeGroup}>
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
          </div>

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
                const accLast4 = acc.accountNumber?.slice(-4) || "****";
                return (
                  <div
                    key={acc._id}
                    onClick={() => {
                      if (acc.verificationStatus !== "pending") setSelectedAccount(acc._id);
                    }}
                    className={`${styles.accountCard} ${isSelected ? styles.accountCardSelected : ""} ${acc.verificationStatus === "pending" ? styles.accountCardPending : ""}`}
                  >
                    {/* Pending badge */}
                    {acc.verificationStatus === "pending" && (
                      <span className={styles.pendingBadge}>Waiting for approval</span>
                    )}

                    {/* Radio - hidden for pending accounts */}
                    {acc.verificationStatus !== "pending" && (
                      <div className={`${styles.accountRadio} ${isSelected ? styles.accountRadioActive : ""}`}>
                        {isSelected && <div className={styles.accountRadioInner} />}
                      </div>
                    )}

                    {/* Bank Logo */}
                    <div className={styles.bankLogo}>
                      <img
                        src={acc.bankImage || acc.logo || AppDefaultImg.DefaultBank}
                        alt={acc.bankName || "Bank"}
                        className={styles.bankLogoImg}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                      <span
                        className={styles.bankLogoFallback}
                        style={{ backgroundColor: bankStyle.bg, color: bankStyle.text, display: "none" }}
                      >
                        {getBankInitials(acc.bankName)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className={styles.bankDetails}>
                      <p className={styles.bankName}>
                        {acc.bankName || "Bank"} {accLast4}
                      </p>
                      <p className={styles.bankAccount}>
                        {acc.accountType ? acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1) : "Savings"} Account
                        {acc.isPrimary && " (Primary)"}
                      </p>
                    </div>

                    {/* Menu */}
                    <div className={styles.accountMenuWrapper}>
                      <button
                        className={styles.accountMenuBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === acc._id ? null : acc._id);
                        }}
                        aria-label="Account options"
                      >
                        <Icons.MoreVertical size={22} />
                      </button>

                      {openMenuId === acc._id && (
                        <div className={styles.accountDropdown} onClick={(e) => e.stopPropagation()}>
                          <button
                            className={styles.accountDropdownItem}
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/bank-accounts/edit/${acc._id}`, { state: { account: acc } });
                            }}
                          >
                            <Icons.Edit size={16} className={styles.dropdownIconPrimary} />
                            Edit account
                          </button>
                          <div className={styles.accountDropdownDivider} />
                          <button
                            className={styles.accountDropdownItemDanger}
                            onClick={() => {
                              setOpenMenuId(null);
                              handleDeleteAccount(acc._id);
                            }}
                          >
                            <Icons.Trash size={16} />
                            Deactivate
                          </button>
                        </div>
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
      <div className={styles.footer}>
        <Button
          variant="primary"
          disabled={!amount || !selectedAccount || Number(amount) <= 0 || Number(amount) > walletBalance}
          onClick={handleWithdraw}
          icon={<Icons.ChevronRight size={16} />}
        >
          Withdraw Money
        </Button>
      </div>
    </div>
  );
};

export default WithdrawMoney;
