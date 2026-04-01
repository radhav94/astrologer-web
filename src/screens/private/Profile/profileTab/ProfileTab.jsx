import { useState } from "react";
import { Link } from "react-router-dom";
import { LuPencilLine } from "react-icons/lu";
import styles from "./ProfileTab.module.scss";
import { AppDefaultImg, AppImages } from "../../../../utils/appImages";
import dayjs from "dayjs";
import { formatIndianPhone, getDefaultImgBasedOnGender } from "../../../../utils/utils";

const ProfileTab = ({ profileData }) => {
  const [isAchievementExpanded, setIsAchievementExpanded] = useState(false);

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
    expertise = [],
    education = [],
    achievements,
    achievementImages = [],
  } = profileData;

  const formattedPhone = formatIndianPhone(phone);


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
            src={profileImage || getDefaultImgBasedOnGender(gender)}
            alt={name}
            className={styles.profileImage}
          />
          <div className={styles.basicInfo}>
            <h3 className={styles.userName}>{name}</h3>
            <p className={styles.userDetail}>
              {dateOfBirth} {gender ? `• ${gender}` : ""}
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
              <span key={index} className={styles.tag}>
                {lang?.languageName}
              </span>
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
          {expertise.length > 0 ? (
            expertise.map((expert, index) => (
              <span key={index} className={styles.tag}>
                {expert?.title}
              </span>
            ))
          ) : (
            <span className={styles.tag}>No expertise added</span>
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
          {education?.length > 0 &&
          education?.some((edu) => edu?.qualification) ? (
            education
              .filter((edu) => edu?.qualification)
              .map((edu, index) => (
                <span key={index} className={styles.tag}>
                  {edu?.qualification || edu?.levelOfEducation}
                </span>
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
          {achievements[0]?.achievementName && (
            <>
              {isAchievementExpanded
                ? achievements[0].achievementName
                : achievements[0].achievementName.length > 100
                  ? `${achievements[0].achievementName.substring(0, 100)}...`
                  : achievements[0].achievementName}
              
              {!isAchievementExpanded &&
                achievements[0].achievementName.length > 100 && (
                  <>
                    {" "}
                    <span
                      className={styles.readMore}
                      onClick={() => setIsAchievementExpanded(true)}
                    >
                      Read More
                    </span>
                  </>
                )}
            </>
          ) }
        </p>
        <div className={styles.imagesGrid}>
        {achievements.length > 0 ? (
          achievements.map((achievement, index) => (
            <div key={index}>
              
                <div className={styles.imageBox}>
                  <img
                    src={achievement?.achievementImgUrl}
                    alt={`achievement ${index + 1}`}
                  />
                </div>
              
            </div>
          ))
        ) : (
          <p className={styles.achievementsText}>No achievements added yet.</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
