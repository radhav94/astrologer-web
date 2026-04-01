import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Icons } from "../../../../components/Icons";
import { useWithdrawRequestMutation } from "../../../../redux/bankAccountApi/bankAccountApi";
import { Toast } from "../../../../components";
import { AppDefaultImg } from "../../../../utils/appImages";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Button from "../../../../components/UI/button/Button";
import styles from "./ConfirmWithdrawal.module.scss";

const getBankInitials = (name) => {
  if (!name) return "B";
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const ConfirmWithdrawal = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { amount, withdrawalType, account } = state || {};
  const [withdrawRequest, { isLoading }] = useWithdrawRequestMutation();

  if (!amount || !account) {
    navigate("/withdraw-money", { replace: true });
    return null;
  }

  const accLast4 = account.accountNumber?.slice(-4) || "****";
  const bankName = account.bankName || "Bank";
  const accType = account.accountType
    ? account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)
    : "Savings";

  const handleConfirm = async () => {
    try {
      const res = await withdrawRequest({
        requested_amount: Number(amount),
        bank_detail: {
          account_number: account.accountNumber,
          ifsc_code: account.ifscCode,
          account_holder_name: account.accountHolderName,
          bank_name: account.bankName,
          branch_name: account.branchName || "",
          account_type: account.accountType || "savings",
        },
        remarks: withdrawalType === "instant" ? "Instant withdrawal" : "Standard withdrawal",
      }).unwrap();

      if (res?.success) {
        navigate("/withdrawal-success", {
          state: {
            amount,
            withdrawalType,
            account,
            requestId: res?.data?.requestId || res?.data?._id || "",
            timestamp: dayjs().toISOString(),
          },
          replace: true,
        });
      } else {
        Toast.error(res?.message || "Withdrawal failed");
      }
    } catch (err) {
      Toast.error(err?.data?.message || "Withdrawal request failed");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <SectionHeader title="Confirm Withdrawal" />

      <div className={styles.content}>
        {/* Amount Banner */}
        <div className={styles.amountBanner}>
          <div className={styles.amountBannerLeft}>
            <span className={styles.amountBannerLabel}>Withdrawal Amount</span>
            <span className={styles.amountBannerValue}>₹{Number(amount).toLocaleString("en-IN")}</span>
          </div>
          <span className={styles.typeBadge}>
            <span className={styles.typeDot} />
            {withdrawalType === "instant" ? "Instant" : "Standard"}
          </span>
        </div>

        {/* Withdraw Money to */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Withdraw Money to</p>
          <div className={styles.bankCard}>
            <div className={styles.bankLogo}>
              <img
                src={account.bankImage || account.logo || AppDefaultImg.DefaultBank}
                alt={bankName}
                className={styles.bankLogoImg}
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
              />
              <span className={styles.bankLogoFallback} style={{ display: "none" }}>
                {getBankInitials(bankName)}
              </span>
            </div>
            <div className={styles.bankInfo}>
              <div className={styles.bankNameRow}>
                <span className={styles.bankName}>{bankName} {accLast4}</span>
                {account.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
              </div>
              <span className={styles.bankMeta}>••••{accLast4} • {accType} Account</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Summary</p>
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Withdrawal Amount</span>
              <span className={styles.summaryValue}>₹{Number(amount).toLocaleString("en-IN")}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span>You will receive</span>
              <span className={styles.summaryValueBold}>₹{Number(amount).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <Icons.AlertCircle size={16} className={styles.infoIcon} />
            <span className={styles.infoTitle}>Important Information</span>
          </div>
          <ul className={styles.infoList}>
            <li>Withdrawal requests cannot be cancelled once confirmed</li>
            <li>Ensure your bank account details are correct</li>
            <li>You will receive a confirmation once processed</li>
          </ul>
        </div>

        {/* Security note */}
        <div className={styles.securityNote}>
          <Icons.CheckCircle size={16} className={styles.securityIcon} />
          <span>Secured and encrypted transaction</span>
        </div>
      </div>

      {/* Confirm Button */}
      <div className={styles.footer}>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isLoading}
          icon={!isLoading ? <Icons.ChevronRight size={16} /> : undefined}
        >
          {isLoading ? "Processing..." : "Confirm Withdraw"}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmWithdrawal;
