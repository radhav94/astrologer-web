import { ChevronLeft } from 'lucide-react';
import styles from "./BackButton.module.scss";

const BackButton = ({ 
  label = '', 
  onClick, 
  icon: Icon = null, 
  className = '', 
  customStyle = {},
  iconSize = 20,
  disabled = false 
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  return (
    <div className={`${styles.backButtonWrapper} ${className}`} style={customStyle}>
      <button
        onClick={handleClick}
        className={styles.backButton}
        disabled={disabled}
        aria-label={label || "Go back"}
        type="button"
      >
        {Icon ? <Icon size={iconSize} /> : <ChevronLeft size={iconSize} />}
        {label && <span className={styles.label}>{label}</span>}
      </button>
    </div>
  );
};

export default BackButton;