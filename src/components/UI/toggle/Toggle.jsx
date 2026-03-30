import styles from "./Toggle.module.scss";

const Toggle = ({
  label,
  checked = false,
  onChange,
  showLabel = true,
  size = "medium",
  disabled = false,
  labelPosition = "left",
  className = "",
  name,
  id,
}) => {
  const toggleId = id || name || undefined;

  const containerClasses = [
    styles.toggleContainer,
    styles[`label${labelPosition.charAt(0).toUpperCase() + labelPosition.slice(1)}`],
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(" ");

  const switchClasses = [
    styles.toggleSwitch,
    styles[size],
    checked && styles.toggleActive,
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {showLabel && label && (
        <label htmlFor={toggleId} className={styles.toggleLabel}>
          {label}
        </label>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={!showLabel && label ? label : undefined}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={switchClasses}
      >
        <span aria-hidden="true" className={styles.toggleThumb} />
      </button>
    </div>
  );
};

export default Toggle;
