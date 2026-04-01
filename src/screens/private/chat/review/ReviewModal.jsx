import { useState } from "react";
import { Icons } from "../../../../components/Icons";
import styles from "./ReviewModal.module.scss";
import { AppIcons } from "../../../../utils/appImages";

const ReviewModal = ({ onClose, onSubmit, ratedUserName, reviewerName }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isAnonymous, setAnonymous] = useState(false);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Please Rate your Experience</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <Icons.X size={14} />
          </button>
        </div>

        {/* Stars */}
        <div className={styles.stars}>
         {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              className={`${styles.star} ${i <= rating ? styles.active : ""}`}
              onClick={() => setRating(i)}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              aria-checked={i <= rating}
              role="radio"
            >
              <img
                className={styles.starActive}
                src={AppIcons.ActiveStarIcon}
                alt=""
              />
              <img
                className={styles.starInactive}
                src={AppIcons.InActiveStarIcon}
                alt=""
              />
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell us about your experience (optional)"
          className={styles.textarea}
          rows={6}
        />

        {/* Anonymous checkbox */}
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxLabel}>Hide my name from the review</span>
        </label>

        {/* Submit */}
        <button
          onClick={() => onSubmit({ rating, review, isAnonymous })}
          disabled={rating === 0}
          className={styles.submitBtn}
        >
          Submit
          <Icons.ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
