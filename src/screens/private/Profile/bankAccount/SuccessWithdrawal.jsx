import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Icons } from "../../../../components/Icons";
import { appGifs } from "../../../../utils/appImages";
import Button from "../../../../components/UI/button/Button";
import styles from "./SuccessWithdrawal.module.scss";

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  return dayjs(isoString).format("MMM DD, YYYY • hh:mm A");
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
            src={appGifs.SuccessConfetti}
            alt="Success"
            className={styles.badgeGif}
          />
        </div>

        <h1 className={styles.title}>Withdrawal Successful!</h1>
        <p className={styles.subtitle}>
          Your withdrawal request has been submitted
        </p>

        {/* Details card */}
        <div className={styles.card}>
          <div className={styles.amountSection}>
            <span className={styles.amountLabel}>Withdrawal Amount</span>
            <span className={styles.amountValue}>
              ₹{Number(amount).toLocaleString("en-IN")}
            </span>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Time</span>
            <span className={styles.detailValue}>
              {formatDateTime(timestamp)}
            </span>
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
          <div className={styles.infoIconWrap}>
            <Icons.AlertCircle size={20} />
             <p className={styles.infoTitle}>Processing Now</p>
          </div>
          <div className={styles.infoContent}>
           
            <p className={styles.infoText}>
              Your withdrawal request has been submitted successfully. We are
              processing your request.
            </p>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className={styles.footer}>
        <Button
          variant="primary"
          onClick={() => navigate("/profile", { replace: true })}
        >
          View Transaction Details
        </Button>
        <Button
          className={styles.backhomebtn}
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default SuccessWithdrawal;
