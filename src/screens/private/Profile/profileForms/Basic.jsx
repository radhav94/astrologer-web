import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import Button from "../../../../components/UI/button/Button"
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";

const Basic = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("Pandit Radha Swami");
  const [gender, setGender] = useState("Female");
  const [dob, setDob] = useState("01/01/2002");
  const [email, setEmail] = useState("hariprasad@gmail.com");
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleSave = () => {
    // Save logic here
    navigate("/profile");
  };

  return (
    <div className={styles.basicContainer}>
      {/* Header */}
      <SectionHeader title="Basic Details" />

      {/* Form Content */}
      <div className={styles.formContent}>
        {/* Name Field */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Enter your name"
          />
        </div>

        {/* Gender Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Your Identity</label>
          <div className={styles.genderOptions}>
            <button
              className={`${styles.genderButton} ${styles.male} ${
                gender === "Male" ? styles.selected : ""
              }`}
              onClick={() => setGender("Male")}
            >
              <span className={styles.genderIcon}>♂</span>
              <span className={styles.genderLabel}>Male</span>
            </button>
            <button
              className={`${styles.genderButton} ${styles.female} ${
                gender === "Female" ? styles.selected : ""
              }`}
              onClick={() => setGender("Female")}
            >
              <span className={styles.genderIcon}>♀</span>
              <span className={styles.genderLabel}>Female</span>
            </button>
            <button
              className={`${styles.genderButton} ${styles.others} ${
                gender === "Others" ? styles.selected : ""
              }`}
              onClick={() => setGender("Others")}
            >
              <span className={styles.genderIcon}>⚥</span>
              <span className={styles.genderLabel}>Others</span>
            </button>
          </div>
        </div>

        {/* Birth Date */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Birth Date</label>
          <div className={styles.dateInput}>
            <input
              type="text"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={styles.input}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="example@gmail.com"
          />
        </div>

        {/* Profile Photo */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Profile Photo</label>
          <label className={styles.fileUpload} htmlFor="profile-photo">
            <div className={styles.uploadIcon}>+</div>
            <div className={styles.uploadText}>Tap here to add file</div>
            <div className={styles.uploadSubtext}>(.jpg, .png , .pdf)</div>
            <input
              id="profile-photo"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave}>
        Save <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default Basic;
