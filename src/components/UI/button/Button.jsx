import styles from "./Button.module.scss";

const Button = ({ 
  children, 
  className = "", 
  variant = "primary", 
  size = "medium",
  fullWidth = true,
  icon,
  iconPosition = "right",
  ...props 
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      className={buttonClasses}
      {...props}
    >
      {icon && iconPosition === "left" && <span className={styles.icon}>{icon}</span>}
      <span className={styles.content}>{children}</span>
      {icon && iconPosition === "right" && <span className={styles.icon}>{icon}</span>}
    </button>
  );
};

export default Button;