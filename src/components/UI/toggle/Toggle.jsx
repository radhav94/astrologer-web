import styles from "./Toggle.module.scss";

const Toggle = ({ label, checked, onChange, showLabel = true }) => {
  return (
    <div className={styles.toggleContainer}>
      {showLabel && label && (
        <span className={styles.toggleLabel}>{label}</span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${styles.toggleSwitch} ${checked ? styles.toggleActive : ""}`}
      >
        <span
          aria-hidden="true"
          className={styles.toggleThumb}
        />
      </button>
    </div>
  );
};

export default Toggle;
