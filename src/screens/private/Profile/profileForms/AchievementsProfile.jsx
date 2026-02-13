import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import { Button, Toggle, SectionHeader } from "./ui";
import styles from "./ProfileForms.module.scss";
import { AppImages } from "../../../../utils/appImages";

const AchievementsProfile = () => {
  const navigate = useNavigate();

  // 🔥 FORCE SCROLL TO TOP – WORKS IN ALL DASHBOARD LAYOUTS
  useEffect(() => {
    // Window
    window.scrollTo(0, 0);

    // Document
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Any scrollable container
    const scrollables = document.querySelectorAll("*");
    scrollables.forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  }, []);

  const [bio, setBio] = useState(
    "With years of dedicated practice, I've guided thousands of individuals across love, career, health, and life direction. My work combines classical Vedic principles with deep intuitive understanding, helping clients receive guidance."
  );

  const [displayOnProfile, setDisplayOnProfile] = useState(true);
  const [attachments, setAttachments] = useState([
    { id: 1, image: AppImages.AchivmentImg },
    { id: 2, image: AppImages.AchivmentImg },
    { id: 3, image: AppImages.AchivmentImg },
  ]);

  const handleAddAttachment = () => {
    setAttachments([...attachments, { id: attachments.length + 1, image: null }]);
  };

  const handleFileUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(
          attachments.map((att) =>
            att.id === id ? { ...att, image: reader.result } : att
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save logic here
    navigate("/profile");
  };

  return (
    <div className={styles.basicContainer}>
      <SectionHeader title="Achievements" />

      <div className={styles.formContent}>
        {/* Bio Textarea */}
        <div className={styles.formGroup}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles.bioTextarea}
            placeholder="For eg: With years of dedicated practice, I've guided thousands of individuals across love, career, health, and life direction. My work combines classical Vedic principles with deep intuitive understanding, helping clients receive guidance."
            rows={6}
          />
        </div>

        {/* Attachments */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Attachments</label>
          <div className={styles.attachmentsGrid}>
            {attachments.map((att) => (
              <div key={att.id} className={styles.attachmentItem}>
                {att.image ? (
                  <img src={att.image} alt="attachment" className={styles.attachmentImage} />
                ) : (
                  <div className={styles.attachmentPlaceholder} />
                )}
              </div>
            ))}
            <label className={styles.addAttachment} htmlFor="add-attachment">
              <div className={styles.addIcon}>⊕</div>
              <div className={styles.addText}>Add</div>
              <input
                id="add-attachment"
                type="file"
                accept="image/*"
                onChange={(e) => handleAddAttachment()}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* Display on Profile Toggle */}
        <div className={styles.formGroup}>
          <Toggle
            label="Display on Profile"
            checked={displayOnProfile}
            onChange={setDisplayOnProfile}
          />
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave}>
        Save <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default AchievementsProfile;
