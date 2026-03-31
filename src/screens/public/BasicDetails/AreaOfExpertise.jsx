import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
// Old: string-based validation import
// import { createMultiSelectValidation } from "../../../utils/utlis";
import { EXPERTISE_AREAS } from "../../../utils/config";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import styles from "./BasicForms.module.scss";

const AreaOfExpertise = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);

  // Normalize existing specialties from Redux: handle both old format (strings) and new format (objects)
  const normalizedExistingSpecialties = (registerData?.specialties || []).map((item) =>
    typeof item === "string"
      ? { title: item, slug: item.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-") }
      : item
  );

  // Old: string-based validation
  // const validationSchema = Yup.object().shape({
  //   specialties: createMultiSelectValidation({
  //     fieldName: "Specialties",
  //     minSelections: 1,
  //     maxSelections: 6,
  //     required: true,
  //   }),
  // });

  // New: object-based validation { title, slug }
  const validationSchema = Yup.object().shape({
    specialties: Yup.array()
      .of(Yup.object().shape({ title: Yup.string(), slug: Yup.string() }))
      .min(1, "Please select at least one specialty")
      .max(6, "You can select up to 6 specialties only")
      .required("Specialties is required"),
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      specialties: normalizedExistingSpecialties,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true, // Allow form to reinitialize when Redux state changes
    onSubmit: (values) => {
      // Old: send only slugs for API payload
      // dispatch(updateRegisterData({
      //   specialties: values.specialties.map((item) => item.slug),
      // }));

      // New: send as array of objects { title, slug }
      dispatch(updateRegisterData({
        specialties: values.specialties.map((item) => ({ title: item.title, slug: item.slug })),
      }));
      
      // Update current step
      dispatch(setCurrentStep(7));
      
      // Navigate to next step
      navigate("/kyc-verification");
    },
  });

  // Check if a specialty is currently selected (compare by slug)
  const isSpecialtySelected = (slug) =>
    formik.values.specialties.some((item) => item?.slug === slug);

  // Old: string-based toggle
  // const toggleSelect = (item) => {
  //   const currentSpecialties = formik.values.specialties;
  //   const newSpecialties = currentSpecialties.includes(item.title)
  //     ? currentSpecialties.filter((i) => i !== item.title)
  //     : [...currentSpecialties, item.title];
  //   formik.setFieldValue("specialties", newSpecialties);
  // };

  // New: object-based toggle by slug
  const toggleSelect = (item) => {
    const currentSpecialties = formik.values.specialties;
    if (isSpecialtySelected(item?.slug)) {
      formik.setFieldValue(
        "specialties",
        currentSpecialties.filter((s) => s?.slug !== item?.slug),
      );
    } else {
      formik.setFieldValue("specialties", [...currentSpecialties, { title: item?.title, slug: item?.slug }]);
    }
  };

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.specialties.length > 0 &&
    Object.keys(formik.errors).length === 0;

  const handleSkip = () => {
    // Mark current step as completed and move to next step
    dispatch(setCurrentStep(7));
    // Navigate to next step
    navigate("/kyc-verification");
  };

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress + Skip */}
          <div className={styles.progressWithSkip}>
            <FormStep totalSteps={8} currentStep={6} />

            <button 
              type="button"
              onClick={handleSkip} 
              className={styles.skipButton}
            >
              Skip for Now
            </button>
          </div>

          {/* Heading */}
          <h1 className={styles.heading}>
            Area of Expertise
          </h1>
          <p className={styles.subheading}>
            Help users find you for the guidance you're best at,
            choose the life areas you specialize in.
          </p>

          {/* Cards Grid */}
          <div className={styles.formGroup}>
            <div className={styles.expertiseGridFigma}>
              {EXPERTISE_AREAS.map((item) => {
                // Old: string-based check
                // const active = formik.values.specialties.includes(item.title);
                // New: object-based check by slug
                const active = isSpecialtySelected(item.slug);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item)}
                    className={`${styles.expertiseCardFigma} ${
                      active ? styles.expertiseCardFigmaActive : ""
                    }`}
                    style={{ background: item.bgGradient }}
                  >
                    <div className={styles.expertiseCardContent}>
                      <h3 className={styles.expertiseCardTitle}>{item.title}</h3>
                      <div 
                        className={styles.expertiseIconCircle}
                        style={{ backgroundColor: item.iconBgColor }}
                      >
                        <img 
                          src={item.icon} 
                          alt={item.title}
                          className={styles.expertiseIcon}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {formik.touched.specialties && formik.errors.specialties && (
              <p className={styles.errorText}>{formik.errors.specialties}</p>
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

export default AreaOfExpertise;
