import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createMultiSelectValidation } from "../../../utils/utlis";
import { EXPERTISE_AREAS } from "../../../utils/config";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import styles from "./BasicForms.module.scss";

const AreaOfExpertise = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    specialties: createMultiSelectValidation({
      fieldName: "Specialties",
      minSelections: 1,
      maxSelections: 6,
      required: true,
    }),
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      specialties: registerData?.specialties || [],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true, // Allow form to reinitialize when Redux state changes
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        specialties: values.specialties,
      }));
      
      // Update current step
      dispatch(setCurrentStep(7));
      
      // Navigate to next step
      navigate("/verifyprofile");
    },
  });

  const toggleSelect = (item) => {
    const currentSpecialties = formik.values.specialties;
    const newSpecialties = currentSpecialties.includes(item.title)
      ? currentSpecialties.filter((i) => i !== item.title)
      : [...currentSpecialties, item.title];
    
    formik.setFieldValue("specialties", newSpecialties);
  };

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.specialties.length > 0 &&
    Object.keys(formik.errors).length === 0;

  const handleSkip = () => {
    // Mark current step as completed and move to next step
    dispatch(setCurrentStep(7));
    // Navigate to next step
    navigate("/verifyprofile");
  };

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress + Skip */}
          <div className={styles.progressWithSkip}>
            <FormStep totalSteps={6} currentStep={6} />

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
                const active = formik.values.specialties.includes(item.title);

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
