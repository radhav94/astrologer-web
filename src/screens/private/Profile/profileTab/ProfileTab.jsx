import { Link } from "react-router-dom";
import { LuPencilLine } from "react-icons/lu";
import styles from "./ProfileTab.module.scss";
import { AppImages } from "../../../../utils/appImages";

const ProfileTab = () => {
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details"),
  );

  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName =
    firstName && lastName ? `${firstName} ${lastName}` : "Unknown";
  return (
    <div className={styles.profileTabContainer}>
      {/* Basic Details */}
      <div className={styles.sectionCard}>
        <Link to="/profile/basic-details" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Basic Details</span>

        <div className={styles.basicDetailsContent}>
          <img 
            src={AppImages.Astro1} 
            alt={userName} 
            className={styles.profileImage}
          />
          <div className={styles.basicInfo}>
            <h3 className={styles.userName}>{userName}</h3>
            <p className={styles.userDetail}>01 Jan 1990 • Male</p>
            <p className={styles.userDetail}>+91 98989 98989</p>
            <p className={styles.userDetail}>hariprasad@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className={styles.sectionCard}>
        <Link to="/profile/languages" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Languages</span>

        <div className={styles.tagsContainer}>
          <span className={styles.tag}>Hindi</span>
          <span className={styles.tag}>English</span>
        </div>
      </div>

      {/* Professional Details */}
      <div className={styles.sectionCard}>
        <Link to="/profile/professional-details" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Professional Details</span>

        <div className={styles.tagsContainer}>
          <span className={styles.tag}>Vedic</span>
          <span className={styles.tag}>Tarot</span>
          <span className={styles.tag}>KP</span>
        </div>
      </div>

      {/* Educational Details */}
      <div className={styles.sectionCard}>
        <Link to="/profile/educational-details" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Educational Details</span>

        <div className={styles.tagsContainer}>
          <span className={styles.tag}>High School</span>
          <span className={styles.tag}>Undergraduate</span>
          <span className={styles.tag}>Postgraduate</span>
        </div>
      </div>

      {/* Achievements */}
      <div className={styles.sectionCard}>
        <Link to="/profile/achievements" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Achievements</span>

        <p className={styles.achievementsText}>
          With years of dedicated practice, I've guided thousands of
          individuals across love, career, health, and life direction. My work
          combines classical Vedic principles with deep intuitive understanding,
          helping clients receive...{" "}
          <span className={styles.readMore}>Read More</span>
        </p>

        <div className={styles.imagesGrid}>
          <div className={styles.imageBox}>
            <img src={AppImages.ProfileAchivment} alt="achievement" />
          </div>
          <div className={styles.imageBox}>
            <img src={AppImages.ProfileAchivment} alt="achievement" />
          </div>
          <div className={styles.imageBox}>
            <img src={AppImages.ProfileAchivment} alt="achievement" />
          </div>
          <div className={styles.imageBox}>
            <img src={AppImages.ProfileAchivment} alt="achievement" />
            <div className={styles.moreImagesOverlay}>+4</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
