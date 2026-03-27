import { useLocation, useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import { AppImages } from "../../../../utils/appImages";
import styles from "./SuccessWithdrawal.module.scss";

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} • ${String(hours).padStart(2, "0")}:${mins} ${ampm}`;
};

const SuccessWithdrawal = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { amount, withdrawalType, account, requestId, timestamp } = state || {};

  if (!amount) {
    navigate("/withdraw-money", { replace: true });
    return null;
  }

  const bankLabel = account
    ? `${account.bankName || "Bank"} ••••${account.accountNumber?.slice(-4) || "****"}`
    : "—";
  const typeLabel = withdrawalType === "instant" ? "Instant" : "Standard";

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Success badge with confetti */}
        <div className={styles.badgeArea}>
          <img
            src={AppImages.SuccessCheckBg}
            alt=""
            aria-hidden="true"
            className={styles.badgeBg}
          />
          <img
            src={AppImages.SuccessCheck}
            alt="Success"
            className={styles.badge}
          />
        </div>

        <h1 className={styles.title}>Withdrawal Successful!</h1>
        <p className={styles.subtitle}>Your withdrawal request has been submitted</p>

        {/* Details card */}
        <div className={styles.card}>
          <div className={styles.amountSection}>
            <span className={styles.amountLabel}>Withdrawal Amount</span>
            <span className={styles.amountValue}>₹{Number(amount).toLocaleString("en-IN")}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Time</span>
            <span className={styles.detailValue}>{formatDateTime(timestamp)}</span>
          </div>
          {requestId && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Request ID</span>
              <span className={styles.detailValue}>#{requestId}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Bank Account</span>
            <span className={styles.detailValue}>{bankLabel}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Processing Type</span>
            <span className={styles.detailValue}>
              <span className={styles.typeDot} />
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Processing info box */}
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>
            <Icons.AlertCircle size={18} />
          </div>
          <div>
            <p className={styles.infoTitle}>Processing Now</p>
            <p className={styles.infoText}>
              Your withdrawal request has been submitted successfully. We are processing your request.
            </p>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className={styles.footer}>
        <button
          className={styles.primaryBtn}
          onClick={() => navigate("/profile", { replace: true })}
        >
          View Transaction Details
        </button>
        <button
          className={styles.secondaryBtn}
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SuccessWithdrawal;
