import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createDropdownValidation, createMultiSelectValidation } from "../../../utils/utlis";
import Button from "../../../components/UI/button/Button";
import styles from "./BasicForms.module.scss";
import FormStep from "./FormStep";
import { appSvgs } from "../../../utils/appImages";

const EXPERTISE_LIST = [
  "Vedic",
  "Tarot",
  "KP",
  "Life Coach",
  "Palmistry",
  "Nadi",
  "Prashana",
  "Psychic",
  "Vastu",
  "Face Reading",
  "Numerology",
];

const EXPERIENCE_LIST = Array.from({ length: 51 }, (_, i) => i); // 0 to 50

const ProfessionalDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    experience: createDropdownValidation({
      fieldName: "Years of experience",
      validOptions: EXPERIENCE_LIST.map(String),
      required: true,
      emptyValue: "",
    }),
    expertise: createMultiSelectValidation({
      fieldName: "Areas of expertise",
      minSelections: 1,
      required: true,
    }),
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      experience: registerData?.experience || "",
      expertise: registerData?.expertise || [],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true, // Allow form to reinitialize when Redux state changes
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        experience: values.experience,
        expertise: values.expertise,
      }));
      
      // Update current step
      dispatch(setCurrentStep(3));
      
      // Navigate to next step
      navigate("/language-speak");
    },
  });

  const toggleExpertise = (item) => {
    const currentExpertise = formik.values.expertise;
    const newExpertise = currentExpertise.includes(item)
      ? currentExpertise.filter((e) => e !== item)
      : [...currentExpertise, item];
    
    formik.setFieldValue("expertise", newExpertise);
  };

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.experience !== "" &&
    formik.values.expertise.length > 0 &&
    Object.keys(formik.errors).length === 0;

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress Dots */}
          <FormStep totalSteps={6} currentStep={2} />

          {/* Heading */}
          <h1 className={styles.heading}>
            Professional Details
          </h1>
          <p className={styles.subheading}>
            We verify every astrologer to maintain
            <br />
            authenticity and trust.
          </p>

          {/* Experience Dropdown */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Years of Experience in Astrology
            </label>

            <div className={styles.selectWrapper}>
              <select
                name="experience"
                value={formik.values.experience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${styles.select} ${
                  formik.touched.experience && formik.errors.experience
                    ? styles.inputError
                    : ""
                }`}
              >
                <option value="">Select experience</option>
                {EXPERIENCE_LIST.map((year) => (
                  <option key={year} value={year}>
                    {year} {year === 1 ? "Year" : "Years"}
                  </option>
                ))}
              </select>

              {/* Gear Icon */}
              <span className={styles.selectIcon}>
                <img src={appSvgs.ExperienceIcon} alt="icon" />
              </span>
            </div>
            {formik.touched.experience && formik.errors.experience && (
              <p className={styles.errorText}>{formik.errors.experience}</p>
            )}
          </div>

          {/* Expertise */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Area of Expertise
            </label>

            <div className={styles.chipContainer}>
              {EXPERTISE_LIST.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleExpertise(item)}
                  className={`${styles.chip} ${
                    formik.values.expertise.includes(item)
                      ? styles.chipActive
                      : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <p className={styles.helperText}>
              *You can select more than 1.
            </p>
            {formik.touched.expertise && formik.errors.expertise && (
              <p className={styles.errorText}>{formik.errors.expertise}</p>
            )}
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

export default ProfessionalDetails;
