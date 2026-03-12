import { CirclePlus } from "lucide-react";
import styles from "./FileUploadInput.module.scss";

const FileUploadInput = ({
  label,
  optionalText = "(if any)",
  accept = "image/*,.pdf",
  value = "",
  isUploading = false,
  onUpload,
  uploadText = "Tap here to add file",
  uploadSubtext = "(.jpg, .png, .pdf)",
  uploadingText = "Uploading...",
  successText = "File attached",
  changeText = "Click to change file",
}) => {
  const handleClick = () => {
    if (!isUploading && onUpload) {
      onUpload();
    }
  };

  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={styles.label}>
          {label} {optionalText && <span className={styles.optionalText}>{optionalText}</span>}
        </label>
      )}

      <div
        onClick={handleClick}
        className={`${styles.fileUploadBox} ${
          isUploading ? styles.fileUploadBoxDisabled : ""
        }`}
      >
        {isUploading ? (
          <div className={styles.fileUploadContent}>
            <div className={styles.uploadSpinner}></div>
            <p className={styles.fileUploadText}>{uploadingText}</p>
          </div>
        ) : value ? (
          <div className={styles.fileUploadContent}>
            <div className={styles.uploadIconSuccess}>✓</div>
            <p className={styles.fileUploadText}>{successText}</p>
            <p className={styles.fileUploadSubtext}>{changeText}</p>
          </div>
        ) : (
          <div className={styles.fileUploadContent}>
            <CirclePlus 
              size={64} 
              strokeWidth={2}
              className={styles.uploadIconCircle}
            />
            <p className={styles.fileUploadText}>{uploadText}</p>
            <p className={styles.fileUploadSubtext}>{uploadSubtext}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadInput;
