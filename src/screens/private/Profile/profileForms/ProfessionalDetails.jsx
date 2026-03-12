import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import Button from "../../../../components/UI/button/Button";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Chip from "../../../../components/UI/chip/Chip";
import { useSetAstroEditProfileMutation } from "../../../../redux/profileApi/profileApi";
import toast from "../../../../components/toast";

const ProfessionalProfileDtls = () => {
  const navigate = useNavigate();
  const [setAstroEditProfile, { isLoading: isUpdating }] =
    useSetAstroEditProfileMutation();

  // Get astrologer details from Redux state
  const astrologerDetails = useSelector(
    (state) => state.register.astrologerDetails,
  );
  const astrologerIdFromRedux = useSelector(
    (state) => state.register.astrologerId,
  );

  // Fallback to localStorage if Redux doesn't have the data
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details") || "{}",
  );
  const astrologerId = astrologerIdFromRedux || userData?._id;

  // Use Redux state as primary source for prefilling form
  const existingData = astrologerDetails || userData;

  const baseExpertiseOptions = ['Tarot', 'Face Reading', 'Vedic', 'Numerology', 'Palmistry'];

  // Get existing expertise from Redux
  const existingExpertise =
    existingData?.expertise || existingData?.specializations || [];

  // Dynamically add any missing expertise values from Redux to the options list
  const expertiseOptions = [
    ...baseExpertiseOptions,
    ...existingExpertise.filter((spec) => !baseExpertiseOptions.includes(spec)),
  ];

  const experienceYears = Array.from({ length: 51 }, (_, i) => i); // 0 to 50

  // Validation schema
  const validationSchema = Yup.object().shape({
    experience: Yup.number()
      .min(0, "Experience must be at least 0 years")
      .required("Experience is required"),
    expertise: Yup.array()
      .of(Yup.string())
      .min(1, "Please select at least one area of expertise")
      .required("Area of expertise is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      experience: existingData?.experience || 0,
      expertise: existingExpertise,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        await setAstroEditProfile({
          id: astrologerId,
          experience: values.experience,
          expertise: values.expertise,
        }).unwrap();

        toast.success("Professional details updated successfully");
        navigate("/profile");
      } catch (error) {
        console.error("Failed to update professional details:", error);
        toast.error(
          error?.data?.message ||
            "Failed to update professional details. Please try again.",
        );
      }
    },
  });

  const toggleExpertise = (option) => {
    const currentExpertise = formik.values.expertise;
    if (currentExpertise.includes(option)) {
      formik.setFieldValue(
        "expertise",
        currentExpertise.filter((item) => item !== option),
      );
    } else {
      formik.setFieldValue("expertise", [...currentExpertise, option]);
    }
  };

  const isButtonDisabled = !formik.isValid || formik.isSubmitting || isUpdating;

  return (
    <div className={styles.basicContainer}>
      {/* Header */}
      <SectionHeader title="Professional Details" />

      {/* Form Content */}
      <div className={styles.formContent}>
        {/* Experience in Astrology */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Experience in Astrology</label>
          <div className={styles.experienceInput}>
            <select
              name="experience"
              value={formik.values.experience}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={styles.input}
            >
              {experienceYears.map((year) => (
                <option key={year} value={year}>
                  {year} {year === 1 ? "Year" : "Years"}
                </option>
              ))}
            </select>
            <span className={styles.experienceIcon}>
              <Icons.BookOpen size={20} />
            </span>
          </div>
          {formik.touched.experience && formik.errors.experience && (
            <p className={styles.errorText}>{formik.errors.experience}</p>
          )}
        </div>

        {/* Area of Expertise */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Area of Expertise</label>
          <div className={styles.expertiseOptions}>
            {expertiseOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={formik.values.expertise.includes(option)}
                onClick={() => toggleExpertise(option)}
              />
            ))}
          </div>
          <p className={styles.helperText}>*You can select more than 1.</p>
          {formik.touched.expertise && formik.errors.expertise && (
            <p className={styles.errorText}>
              {typeof formik.errors.expertise === "string"
                ? formik.errors.expertise
                : "Please select at least one area of expertise"}
            </p>
          )}
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

export default ProfessionalProfileDtls;
