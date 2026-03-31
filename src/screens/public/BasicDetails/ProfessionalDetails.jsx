import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createDropdownValidation, createMultiSelectValidation } from "../../../utils/utils";
import { useGetExpertiseListQuery } from "../../../redux/register/registerAstroApi";
import Button from "../../../components/UI/button/Button";
import styles from "./BasicForms.module.scss";
import FormStep from "./FormStep";
import { appSvgs } from "../../../utils/appImages";



const EXPERIENCE_LIST = Array.from({ length: 51 }, (_, i) => i); // 0 to 50

const ProfessionalDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);

  // Fetch expertise dynamically from API
  const { data: expertiseApiResponse } = useGetExpertiseListQuery();

  // Extract expertise list where title === "Skill" (no static fallback)
  const skillCategory = expertiseApiResponse?.data?.find(
    (item) => item?.title === "Skill"
  );
  const EXPERTISE_LIST = (skillCategory?.list || []).map((item) => ({
    title: item.title,
    slug: item.slug,
    ID: item.ID || item._id,
    type: item.type,
  }));

  // Normalize existing expertise from Redux: handle both old format (strings) and new format (objects)
  const normalizedExistingExpertise = (registerData?.expertise || []).map((item) =>
    typeof item === "string"
      ? { title: item, slug: item.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-") }
      : item
  );

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    experience: createDropdownValidation({
      fieldName: "Years of experience",
      validOptions: EXPERIENCE_LIST.map(String),
      required: true,
      emptyValue: "",
    }),
    // Old: string-based validation
    // expertise: createMultiSelectValidation({
    //   fieldName: "Areas of expertise",
    //   minSelections: 1,
    //   required: true,
    // }),
    // New: object-based validation { title, slug }
    expertise: Yup.array()
      .of(Yup.object().shape({ title: Yup.string(), slug: Yup.string() }))
      .min(1, "Please select at least one area of expertise")
      .required("Area of expertise is required"),
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      experience: registerData?.experience || "",
      expertise: normalizedExistingExpertise,
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

  // Check if an expertise option is currently selected (compare by slug)
  const isExpertiseSelected = (slug) =>
    formik.values.expertise.some((item) => item?.slug === slug);

  // Old: string-based toggle
  // const toggleExpertise = (item) => {
  //   const currentExpertise = formik.values.expertise;
  //   const newExpertise = currentExpertise.includes(item)
  //     ? currentExpertise.filter((e) => e !== item)
  //     : [...currentExpertise, item];
  //   formik.setFieldValue("expertise", newExpertise);
  // };

  // New: object-based toggle by slug
  const toggleExpertise = (option) => {
    const currentExpertise = formik.values.expertise;
    if (isExpertiseSelected(option?.slug)) {
      formik.setFieldValue(
        "expertise",
        currentExpertise.filter((item) => item?.slug !== option?.slug),
      );
    } else {
      formik.setFieldValue("expertise", [...currentExpertise, { title: option?.title, slug: option?.slug }]);
    }
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
          <FormStep totalSteps={8} currentStep={2} />

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
                  key={item.slug}
                  type="button"
                  onClick={() => toggleExpertise(item)}
                  className={`${styles.chip} ${
                    isExpertiseSelected(item.slug)
                      ? styles.chipActive
                      : ""
                  }`}
                >
                  {item?.title}
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
