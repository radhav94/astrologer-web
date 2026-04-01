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
import { useGetExpertiseListQuery } from "../../../../redux/register/registerAstroApi";
import toast from "../../../../components/toast";

const ProfessionalProfileDtls = () => {
  const navigate = useNavigate();
  const [setAstroEditProfile, { isLoading: isUpdating }] =
    useSetAstroEditProfileMutation();

  const {data:expertiseApiResponse} = useGetExpertiseListQuery();

  const skillCategory = expertiseApiResponse?.data?.find(
    (item) => item?.title === "Skill"
  );
  const baseExpertiseOptions = (skillCategory?.list || []).map((item) => ({
    title: item.title,
    slug: item.slug,
    ID: item.ID || item._id,
    type: item.type,
  }));

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

  // Get existing expertise from Redux
  const existingExpertise =
    existingData?.expertise || existingData?.specializations || [];

  // Normalize existing expertise: handle both old format (strings) and new format (objects)
  const normalizedExistingExpertise = existingExpertise.map((item) =>
    typeof item === "string" ? { title: item, slug: item.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-") } : item
  );

  // Dynamically add any missing expertise values from Redux to the options list
  const existingSlugs = new Set(baseExpertiseOptions.map((opt) => opt.slug));
  const expertiseOptions = [
    ...baseExpertiseOptions,
    ...normalizedExistingExpertise.filter((spec) => !existingSlugs.has(spec.slug)),
  ];

  const experienceYears = Array.from({ length: 51 }, (_, i) => i); // 0 to 50

  // Validation schema
  const validationSchema = Yup.object().shape({
    experience: Yup.number()
      .min(0, "Experience must be at least 0 years")
      .required("Experience is required"),
  
    expertise: Yup.array()
      .of(Yup.object().shape({ title: Yup.string(), slug: Yup.string() }))
      .min(1, "Please select at least one area of expertise")
      .required("Area of expertise is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      experience: existingData?.experience || 0,
      expertise: normalizedExistingExpertise,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        // Send expertise as array of objects { title, slug } to API
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

  // Check if an expertise option is currently selected (compare by slug)
  const isExpertiseSelected = (slug) =>
    formik.values.expertise.some((item) => item?.slug === slug);

  const toggleExpertise = (option) => {
    const currentExpertise = formik.values.expertise;
    if (isExpertiseSelected(option?.slug)) {
      // Remove: filter out by slug
      formik.setFieldValue(
        "expertise",
        currentExpertise.filter((item) => item?.slug !== option?.slug),
      );
    } else {
      // Add: push object with title and slug
      formik.setFieldValue("expertise", [...currentExpertise, { title: option?.title, slug: option?.slug }]);
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
                key={option?.slug}
                label={option?.title}
                selected={isExpertiseSelected(option?.slug)}
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
