import styles from "./Chip.module.scss";

const Chip = ({ 
  label, 
  selected = false, 
  onClick, 
  icon,
  iconPosition = "left",
  variant = "default",
  size = "medium",
  disabled = false,
  className = "",
  ...props 
}) => {
  const chipClasses = [
    styles.chip,
    selected && styles.selected,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      onClick={onClick}
      className={chipClasses}
      disabled={disabled}
      type="button"
      {...props}
    >
      {icon && iconPosition === "left" && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
      {icon && iconPosition === "right" && <span className={styles.icon}>{icon}</span>}
    </button>
  );
};

export default Chip;