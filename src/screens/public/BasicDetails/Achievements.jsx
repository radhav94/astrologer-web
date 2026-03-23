import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createAchievementsValidation } from "../../../utils/utlis";
import { useFileUpload } from "../../../hooks/useFileUpload";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import FileUploadInput from "../../../components/UI/fileUploadInput/FileUploadInput";
import Toggle from "../../../components/UI/toggle/Toggle";
import styles from "./BasicForms.module.scss";

const Achievements = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uploadFile } = useFileUpload();
  const registerData = useSelector((state) => state.register.registerData);
  const [uploadingAchievement, setUploadingAchievement] = useState(false);

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    achievements: createAchievementsValidation({
      required: true,
      minEntries: 1,
      minLength: 50,
      maxLength: 500,
      certificateRequired: false,
    }),
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      achievements: registerData?.achievements || [
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
    enableReinitialize: true, // Allow form to reinitialize when Redux state changes
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        achievements: values.achievements,
      }));
      
      // Update current step
      dispatch(setCurrentStep(6));
      
      // Navigate to next step
      navigate("/areaofexpertise");
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

  const handleSkip = () => {
    // Mark current step as completed and move to next step
    dispatch(setCurrentStep(6));
    // Navigate to next step
    navigate("/areaofexpertise");
  };
 
  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress + Skip */}
          <div className={styles.progressWithSkip}>
            <FormStep totalSteps={7} currentStep={5} />

            <button 
              type="button"
              onClick={handleSkip} 
              className={styles.skipButton}
            >
              Skip for Now
            </button>
          </div>

          {/* Heading */}
          <h1 className={styles.heading}>Achievements</h1>
          <p className={styles.subheading}>
            Show your milestones, recognitions and contributions.
            <br />
            This helps clients know your depth and experience.
          </p>

          {/* Textarea */}
          <div className={styles.formGroup}>
            <textarea
              rows={5}
              name="achievements.0.achievementName"
              value={formik.values.achievements[0].achievementName}
              onChange={handleDescriptionChange}
              onBlur={formik.handleBlur}
              placeholder="Tell us about your Achievements..."
              className={`${styles.textarea} ${
                formik.touched.achievements?.[0]?.achievementName && formik.errors.achievements?.[0]?.achievementName
                  ? styles.inputError
                  : ""
              }`}
            />
            {formik.touched.achievements?.[0]?.achievementName && formik.errors.achievements?.[0]?.achievementName && (
              <p className={styles.errorText}>{formik.errors.achievements[0].achievementName}</p>
            )}
          </div>

          {/* File Upload */}
          <FileUploadInput
            label="Attach Certificate"
            optionalText="(if any)"
            accept="image/*,.pdf"
            value={formik.values.achievements[0].achievementImgUrl}
            isUploading={uploadingAchievement}
            onUpload={handleFileUpload}
            uploadText="Tap here to add file"
            uploadSubtext="(.jpg, .png, .pdf)"
          />

          {/* Display on Profile Toggle */}
          <div className={styles.toggleWrapper}>
            <Toggle
              label="Display on Profile"
              checked={formik.values.achievements[0].display}
              onChange={(value) => formik.setFieldValue("achievements.0.display", value)}
            />
          </div>
        </div>

        {/* Next Button */}
        <div className={styles.formLayoutFooter}>
          <Button
            type="submit"
            onClick={formik.handleSubmit}
            disabled={!isFormValid || formik.isSubmitting}
            className={`${styles.formButton} ${
              !isFormValid || formik.isSubmitting
                ? styles.formButtonDisabled
                : ""
            }`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
