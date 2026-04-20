import { TrendingUp, TrendingDown } from "lucide-react";
import styles from "./StatCard.module.scss";

const variantClass = {
  primary: styles.variantPrimary,
  success: styles.variantSuccess,
  info: styles.variantInfo,
  warning: styles.variantWarning,
};

export const StatCard = ({ icon: Icon, label, value, change, subtext, variant = "primary" }) => {
  const positive = change >= 0;
  const vClass = variantClass[variant] || variantClass.primary;

  return (
    <div className={styles.card}>
      <div className={`${styles.glow} ${vClass}`} />
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={`${styles.iconBox} ${vClass}`}>
            <Icon className={styles.icon} />
          </div>
          <span className={`${styles.badge} ${positive ? styles.badgePositive : styles.badgeNegative}`}>
            {positive ? <TrendingUp className={styles.trendIcon} /> : <TrendingDown className={styles.trendIcon} />}
            {positive ? "+" : ""}{change}%
          </span>
        </div>
        <p className={styles.label}>{label}</p>
        <h3 className={styles.value}>{value}</h3>
        <p className={styles.subtext}>{subtext}</p>
      </div>
    </div>
  );
};

export default StatCard;