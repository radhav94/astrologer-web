import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Icons } from "../../../../components/Icons";
import Button from "../../../../components/UI/button/Button";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Toggle from "../../../../components/UI/toggle/Toggle";
import FileUploadInput from "../../../../components/UI/fileUploadInput/FileUploadInput";
import styles from "./ProfileForms.module.scss";
import { AppImages } from "../../../../utils/appImages";
import { createAchievementsValidation } from "../../../../utils/utlis";
import { useFileUpload } from "../../../../hooks/useFileUpload";
import { useSetAstroEditProfileMutation } from "../../../../redux/profileApi/profileApi";
import toast from "../../../../components/toast";

const AchievementsProfile = () => {
  const navigate = useNavigate();
  const { uploadFile } = useFileUpload();
  const [setAstroEditProfile, { isLoading: isUpdating }] =
    useSetAstroEditProfileMutation();
  const astrologerIdFromRedux = useSelector(
    (state) => state.register.astrologerId,
  );

  // Fallback to localStorage if Redux doesn't have the ID
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details"),
  );
  const astrologerId = astrologerIdFromRedux || userData?._id;

  const [uploadingAchievement, setUploadingAchievement] = useState(false);
  const [attachments, setAttachments] = useState([
    
  ]);

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

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    achievements: createAchievementsValidation({
      required: true,
      minEntries: 1,
      minLength: 10,
      maxLength: 500,
      certificateRequired: false,
    }),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      achievements: [
        {
          achievementName: "",
          achievementImgUrl: "",
          display: false,
        },
      ],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Call the mutation API with the correct body format
        // The API spreads ...body, so we pass achievements directly
        await setAstroEditProfile({
          id: astrologerId,
          achievements: values.achievements,
        }).unwrap();

        // Show success message
        toast.success("Achievements updated successfully");

        // Navigate back to profile
        navigate("/profile");
      } catch (error) {
        // Handle error
        console.error("Failed to update achievements:", error);
        toast.error(
          error?.data?.message ||
            "Failed to update achievements. Please try again.",
        );
      }
    },
  });

  const handleDescriptionChange = (e) => {
    formik.setFieldValue("achievements.0.achievementName", e.target.value);
  };

  const handleFileUpload = async () => {
    try {
      setUploadingAchievement(true);

      // Use the custom hook to upload file
      const fileUrl = await uploadFile("image/*,.pdf");

      if (fileUrl) {
        // Set the uploaded file URL in Formik
        formik.setFieldValue("achievements.0.achievementImgUrl", fileUrl);
        
        // Add the uploaded file URL to attachments for preview
        setAttachments((prev) => [
          ...prev,
          { id: prev.length + 1, image: fileUrl },
        ]);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploadingAchievement(false);
    }
  };

  // Check if all required fields are filled and valid
  const isFormValid =
    formik.values.achievements[0].achievementName.trim() !== "" &&
    Object.keys(formik.errors).length === 0;

  const isButtonDisabled = !isFormValid || formik.isSubmitting || isUpdating;

  return (
    <div className={styles.basicContainer}>
      <SectionHeader title="Achievements" />

      <div className={styles.formContent}>
        {/* Bio Textarea */}
        <div className={styles.formGroup}>
          <textarea
            name="achievements.0.achievementName"
            value={formik.values.achievements[0].achievementName}
            onChange={handleDescriptionChange}
            onBlur={formik.handleBlur}
            className={`${styles.bioTextarea} ${
              formik.touched.achievements?.[0]?.achievementName &&
              formik.errors.achievements?.[0]?.achievementName
                ? styles.inputError
                : ""
            }`}
            placeholder="For eg: With years of dedicated practice, I've guided thousands of individuals across love, career, health, and life direction. My work combines classical Vedic principles with deep intuitive understanding, helping clients receive guidance."
            rows={6}
          />
          {formik.touched.achievements?.[0]?.achievementName &&
            formik.errors.achievements?.[0]?.achievementName && (
              <p className={styles.errorText}>
                {formik.errors.achievements[0].achievementName}
              </p>
            )}
        </div>

        {/* Attachments */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Attachments</label>
          <div className={styles.attachmentsGrid}>
            {attachments.map((att) => (
              <div key={att.id} className={styles.attachmentItem}>
                {att.image ? (
                  <img
                    src={att.image}
                    alt="attachment"
                    className={styles.attachmentImage}
                  />
                ) : (
                  <div className={styles.attachmentPlaceholder} />
                )}
              </div>
            ))}
            {!attachments.length && (
              <FileUploadInput
                optionalText="(if any)"
                accept="image/*,.pdf"
                value={formik.values.achievements[0].achievementImgUrl}
                isUploading={uploadingAchievement}
                onUpload={handleFileUpload}
                uploadText="Add"
                uploadSubtext="(.jpg, .png, .pdf)"
                cla
              />
            )}
          </div>
        </div>

        {/* Display on Profile Toggle */}
        <div className="mb-6 flex">
          <Toggle
            label="Display on Profile"
            className="flex-inline"
            checked={formik.values.achievements[0].display}
            onChange={(value) =>
              formik.setFieldValue("achievements.0.display", value)
            }
          />
        </div>
      </div>

      {/* Save Button */}
      <Button
        type="submit"
        onClick={formik.handleSubmit}
        disabled={isButtonDisabled}
        className={styles.saveButton}
      >
        {isUpdating ? "Saving..." : "Save"} <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default AchievementsProfile;
