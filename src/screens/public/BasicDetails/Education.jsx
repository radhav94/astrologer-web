import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createEducationValidation } from "../../../utils/utlis";
import { useFileUpload } from "../../../hooks/useFileUpload";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import FileUploadInput from "../../../components/UI/fileUploadInput/FileUploadInput";
import Toggle from "../../../components/UI/toggle/Toggle";
import styles from "./BasicForms.module.scss";

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate",
  "Postgraduate",
  "Prefer not to say",
];

const Education = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uploadFile } = useFileUpload();
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    education: createEducationValidation({
      required: true,
      minEntries: 1,
      universityRequired: false,
      certificateRequired: false,
    }),
    // educationShowOnProfile: Yup.boolean(),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      education: [
        {
          qualification: "",
          universityName: "",
          certificateImgUrl: "",
        },
      ],
      educationShowOnProfile: false,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        education: values.education,
        // educationShowOnProfile: values.educationShowOnProfile,
      }));
      
      // Update current step
      dispatch(setCurrentStep(5));
      
      // Navigate to next step
      navigate("/achievements");
    },
  });

  const handleQualificationChange = (value) => {
    formik.setFieldValue("education.0.qualification", value);
  };

  const handleUniversityChange = (e) => {
    formik.setFieldValue("education.0.universityName", e.target.value);
  };

  const handleFileUpload = async () => {
    try {
      setUploadingCertificate(true);

      // Use the custom hook to upload file
      const fileUrl = await uploadFile("image/*,.pdf");

      if (fileUrl) {
        // Set the uploaded file URL in Formik
        formik.setFieldValue("education.0.certificateImgUrl", fileUrl);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploadingCertificate(false);
    }
  };

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.education[0].qualification !== "" &&
    Object.keys(formik.errors).length === 0;

  const handleSkip = () => {
    // Mark current step as completed and move to next step
    dispatch(setCurrentStep(5));
    // Navigate to next step
    navigate("/achievements");
  };

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>

        {/* Progress + Skip */}
        <div className={styles.progressWithSkip}>
          <FormStep totalSteps={6} currentStep={4} />

          <button 
            type="button"
            onClick={handleSkip}
            className={styles.skipButton}
          >
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>Education</h1>
        <p className={styles.subheading}>
          What's the highest level of education you have attained.
        </p>

        {/* Education Level */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Level of Education
          </label>

          <div className={styles.chipContainer}>
            {EDUCATION_LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleQualificationChange(item)}
                className={`${styles.chip} ${
                  formik.values.education[0].qualification === item
                    ? styles.chipActive
                    : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {formik.touched.education?.[0]?.qualification && formik.errors.education?.[0]?.qualification && (
            <p className={styles.errorText}>{formik.errors.education[0].qualification}</p>
          )}
        </div>

        {/* University */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Select University <span className={styles.optionalText}>(if any)</span>
          </label>

          <div className={styles.selectWrapper}>
            <select
              name="education.0.universityName"
              value={formik.values.education[0].universityName}
              onChange={handleUniversityChange}
              onBlur={formik.handleBlur}
              className={styles.select}
            >
              <option value="">Select</option>
              <option>Delhi University</option>
              <option>Mumbai University</option>
              <option>Pune University</option>
              <option>Other</option>
            </select>

            <ChevronDown className={styles.selectIcon} />
          </div>
        </div>

        {/* Certificate Upload */}
        <FileUploadInput
          label="Attach Certificate"
          optionalText="(if any)"
          accept="image/*,.pdf"
          value={formik.values.education[0].certificateImgUrl}
          isUploading={uploadingCertificate}
          onUpload={handleFileUpload}
          uploadText="Tap here to add file"
          uploadSubtext="(.jpg, .png, .pdf)"
        />

        {/* Display on Profile */}
        <div className={styles.toggleWrapper}>
          <Toggle
            label="Display on Profile"
            checked={formik.values.educationShowOnProfile}
            onChange={(value) => formik.setFieldValue("educationShowOnProfile", value)}
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

export default Education;
