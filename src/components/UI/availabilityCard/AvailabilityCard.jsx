import { Icons } from "../../Icons";
import styles from "./AvailabilityCard.module.scss";

const AvailabilityCard = ({
  type,
  title,
  subtitle,
  isOnline,
  loading,
  onClick,
  Icon,
}) => {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`${styles.availabilityCard} ${
        isOnline ? styles.cardActive : styles.cardInactive
      } ${loading ? styles.cardLoading : ""}`}
    >
      {/* Icon */}
      <div
        className={`${styles.cardIcon} ${
          isOnline ? styles.cardIconActive : styles.cardIconInactive
        }`}
      >
        <Icon
          size={16}
          color={isOnline ? "#fff" : "#F75801"}
          strokeWidth={2.5}
        />
      </div>

      {/* Info */}
      <div className={styles.cardInfo}>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardSubtitle}>{subtitle}</span>
      </div>

      {/* Status */}
      <span
        className={`${styles.statusBadge} ${
          isOnline ? styles.badgeOnline : styles.badgeOffline
        }`}
      >
        <span
          className={`${styles.badgeDot} ${
            isOnline ? styles.dotOnline : styles.dotOffline
          }`}
        />
        {isOnline ? "Online" : "Offline"}
      </span>
    </button>
  );
};

export default AvailabilityCard;