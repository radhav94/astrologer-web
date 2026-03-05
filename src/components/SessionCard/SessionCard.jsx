import React from "react";
import { Phone, Clock, X } from "lucide-react";
import styles from "./SessionCard.module.scss";

const SessionCard = ({
  name,
  profileImage,
  duration = "10 minutes",
  time = "4:36 PM",
  sessionType = "Call",
  onDecline,
  onStart,
}) => {
  return (
    <div className={styles.card}>
      {/* Profile Image */}
      <div className={styles.imageContainer}>
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className={styles.profileImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderText}>
              {name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}
      </div>

      {/* Session Details */}
      <div className={styles.details}>
        {/* Name */}
        <h3 className={styles.name}>{name}</h3>

        {/* Duration and Time */}
        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <Phone size={16} className={styles.iconOrange} />
            <span className={styles.infoText}>{duration}</span>
          </div>
          <div className={styles.infoItem}>
            <Clock size={16} className={styles.iconOrange} />
            <span className={styles.infoText}>{time}</span>
          </div>
        </div>

        {/* Session Type */}
        <p className={styles.sessionType}>
          Session Type : <span className={styles.sessionTypeValue}>{sessionType}</span>
        </p>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            onClick={onDecline}
            className={`${styles.button} ${styles.declineButton}`}
          >
            <X size={18} />
            <span>Decline</span>
          </button>
          <button
            onClick={onStart}
            className={`${styles.button} ${styles.startButton}`}
          >
            <Phone size={18} />
            <span>Start Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
