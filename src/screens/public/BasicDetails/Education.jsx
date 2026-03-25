import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  updateRegisterData,
  setCurrentStep,
} from "../../../reducer/registerSlice";
import { createEducationValidation } from "../../../utils/utlis";
import { useFileUpload } from "../../../hooks/useFileUpload";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import FileUploadInput from "../../../components/UI/fileUploadInput/FileUploadInput";
import Toggle from "../../../components/UI/toggle/Toggle";
import { Icons } from "../../../components/Icons";
import { AppIcons } from "../../../utils/appImages";
import styles from "./BasicForms.module.scss";

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate",
  "Postgraduate",
  "Prefer not to say",
];

const Education = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state?.register?.registerData);
  const { uploadFile } = useFileUpload();
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  // Get existing education from Redux registerData
  const existingEducation = registerData?.education || [];

  console.log("registerData:", registerData);

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
          display:false,
        },
      ],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      const newEntry = values.education[0];

      let updatedEducation;
      if (isEditMode && editingIndex !== null) {
        // Edit mode: update the entry at editingIndex
        updatedEducation = [...existingEducation];
        updatedEducation[editingIndex] = newEntry;
      } else {
        // Add mode: push new entry to existing array
        updatedEducation = [...existingEducation, newEntry];
      }

      // Dispatch to Redux store
      dispatch(
        updateRegisterData({
          education: updatedEducation,
        }),
      );
      setIsAddingNew(false);    
      setIsEditMode(false);
      setEditingIndex(null);
      formik.resetForm();
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

  // Old: same disabled logic for both add and edit
  // const isSaveDisabled = !isFormValid || formik.isSubmitting;

  // Save button disabled logic:
  // - Always disabled while submitting
  // - In edit mode: always enabled (fields are pre-filled)
  // - In add mode: disabled until qualification is selected
  const hasQualification = formik.values.education[0].qualification !== "";
  const isSaveDisabled = formik.isSubmitting || (!isEditMode && !hasQualification);
  const isSaveButtonDisabled = isSaveDisabled && !isFormValid;

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
            <FormStep totalSteps={7} currentStep={4} />

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

          {/* Existing Education Cards or Empty State */}

          {!isAddingNew && (
            <>
              <div className={styles.educationListReg}>
                {existingEducation.length > 0 ? (
                  existingEducation.map((edu, index) => (
                    <div key={index} className={styles.educationCardReg}>
                      {/* Header: Qualification + Edit/Delete */}
                      <div className={styles.educationCardRegHeader}>
                        <h3 className={styles.educationCardRegQualification}>
                          {edu?.qualification || edu?.levelOfEducation}
                        </h3>
                        <div className={styles.educationCardRegActions}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditMode(true);
                              setEditingIndex(index);
                              setIsAddingNew(true);
                              formik.setValues({
                                education: [{
                                  qualification: edu.qualification || "",
                                  universityName: edu.universityName || "",
                                  certificateImgUrl: edu.certificateImgUrl || "",
                                  display: edu.display ?? false,
                                }],
                              });
                            }}
                            className={styles.educationCardRegEditBtn}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = existingEducation.filter((_, i) => i !== index);
                              dispatch(updateRegisterData({ education: updated }));
                            }}
                            className={styles.educationCardRegDeleteBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* University */}
                      <p className={styles.educationCardRegUniversity}>
                        {edu.universityName || "No university specified"}
                      </p>

                      {/* Certificate file */}
                      {edu.certificateImgUrl && (
                        <div className={styles.educationCardRegFile}>
                          <img src={AppIcons.FileIcon} alt="file" />
                          <span className={styles.educationCardRegFileName}>
                            {`Certificate.${edu.certificateImgUrl.split(".").pop()}`}
                          </span>
                        </div>
                      )}

                      {/* Visible on profile */}
                      {edu.display && (
                        <span className={styles.educationCardRegVisible}>
                          ✓ Visible on profile
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.educationEmptyStateReg}>
                    <div className={styles.educationEmptyContentReg}>
                      <img
                        src={AppIcons.Education1}
                        alt="Education"
                        className={styles.educationEmptyIconReg}
                      />
                      <h2 className={styles.educationEmptyTitleReg}>
                        No education added yet
                      </h2>
                      <p className={styles.educationEmptySubtitleReg}>
                        Add your education details below
                      </p>
                    </div>
                  </div>
                )}
                {/* Next Button */}
                <div className={styles.formLayoutFooter}>
                  <Button
                    type="submit"
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingIndex(null);
                      setIsAddingNew(true);
                      formik.resetForm();
                    }}
                    className={styles.addEducationButton}
                  >
                    {existingEducation.length > 0
                      ? "+ Add Another Education"
                      : "+ Add Education"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {isAddingNew && (
            <>
              {/* Education Level */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Level of Education</label>

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
                {formik.touched.education?.[0]?.qualification &&
                  formik.errors.education?.[0]?.qualification && (
                    <p className={styles.errorText}>
                      {formik.errors.education[0].qualification}
                    </p>
                  )}
              </div>

              {/* University */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Select University{" "}
                  <span className={styles.optionalText}>(if any)</span>
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
                  checked={formik.values.education[0].display}
                  onChange={(value) =>
                    formik.setFieldValue("education.0.display", value)
                  }
                />
              </div>
              {/* Next Button */}
              <div className={styles.formLayoutFooter}>
                <Button
                  type="submit"
                  onClick={formik.handleSubmit}
                  disabled={isSaveDisabled}
                  className={`${styles.formButton} ${
                    isSaveDisabled
                      ? styles.formButtonDisabled
                      : ""
                  }`}
                >
                  Save
                </Button>
              </div>
            </>
          )}
        </div>

        {!isAddingNew && (
          <>
            {/* Next Button */}
            <div className={styles.formLayoutFooter}>
              <Button
                onClick={() => {
                  dispatch(setCurrentStep(5));
                  navigate("/achievements");
                }}
                disabled={existingEducation.length === 0}
                className={`${styles.formButton} ${
                  existingEducation.length === 0
                    ? styles.formButtonDisabled
                    : ""
                }`}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Education;
