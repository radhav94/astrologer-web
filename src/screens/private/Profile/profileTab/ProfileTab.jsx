import { Link } from "react-router-dom";
import { LuPencilLine } from "react-icons/lu";
import styles from "./ProfileTab.module.scss";
import { AppImages } from "../../../../utils/appImages";
import dayjs from "dayjs";
import { formatIndianPhone } from "../../../../utils/utlis";

const ProfileTab = ({ profileData, refetch }) => {
  if (!profileData) {
    return <div className={styles.profileTabContainer}>Loading...</div>;
  }

  const {
    name,
    dateOfBirth,
    gender,
    phone,
    email,
    profileImage,
    languages = [],
    specializations = [],
    education = [],
    achievements,
    achievementImages = [],
  } = profileData;

  const formattedPhone = formatIndianPhone(phone);

  console.log("profileData",profileData)

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
            src={profileImage || AppImages.Astro1} 
            alt={name} 
            className={styles.profileImage}
          />
          <div className={styles.basicInfo}>
            <h3 className={styles.userName}>{name}</h3>
            <p className={styles.userDetail}>
              {dateOfBirth} {gender ? `• ${gender}` : ''}
            </p>
            <p className={styles.userDetail}>{formattedPhone}</p>
            <p className={styles.userDetail}>{email}</p>
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
          {languages.length > 0 ? (
            languages.map((lang, index) => (
              <span key={index} className={styles.tag}>{lang}</span>
            ))
          ) : (
            <span className={styles.tag}>No languages added</span>
          )}
        </div>
      </div>

      {/* Professional Details */}
      <div className={styles.sectionCard}>
        <Link to="/profile/professional-details" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Professional Details</span>

        <div className={styles.tagsContainer}>
          {specializations.length > 0 ? (
            specializations.map((spec, index) => (
              <span key={index} className={styles.tag}>{spec}</span>
            ))
          ) : (
            <span className={styles.tag}>No specializations added</span>
          )}
        </div>
      </div>

      {/* Educational Details */}
      <div className={styles.sectionCard}>
        <Link to="/profile/educational-details" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Educational Details</span>

        <div className={styles.tagsContainer}>
          {education.length > 0 ? (
            education.map((edu, index) => (
              <span key={index} className={styles.tag}>{edu}</span>
            ))
          ) : (
            <span className={styles.tag}>No education details added</span>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className={styles.sectionCard}>
        <Link to="/profile/achievements" className={styles.editButton}>
          <LuPencilLine size={16} />
        </Link>

        <span className={styles.sectionTitle}>Achievements</span>

        <p className={styles.achievementsText}>
          {achievements || 'No achievements added yet.'}
          {achievements && achievements.length > 100 && (
            <span className={styles.readMore}> Read More</span>
          )}
        </p>

        {achievementImages.length > 0 && (
          <div className={styles.imagesGrid}>
            {achievementImages.slice(0, 4).map((img, index) => (
              <div key={index} className={styles.imageBox}>
                <img src={img} alt={`achievement ${index + 1}`} />
                {index === 3 && achievementImages.length > 4 && (
                  <div className={styles.moreImagesOverlay}>
                    +{achievementImages.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
