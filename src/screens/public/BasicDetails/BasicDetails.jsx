import { Calendar, Mars, Transgender, Venus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  updateRegisterData,
  setCurrentStep,
} from "../../../reducer/registerSlice";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import styles from "./BasicForms.module.scss";
import {
  nameValidationSchemas,
  genderValidationSchema,
  dobValidationSchema,
  emailValidationSchema,
} from "../../../utils/utlis";

const BasicDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    firstName: nameValidationSchemas.firstName,
    lastName: nameValidationSchemas.lastName,
    gender: genderValidationSchema,
    dateOfBirth: dobValidationSchema,
    email: emailValidationSchema,
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      firstName: registerData?.firstName || "",
      lastName: registerData?.lastName || "",
      gender: registerData?.gender ? registerData.gender.charAt(0).toUpperCase() + registerData.gender.slice(1) : "Female",
      dateOfBirth: registerData?.dateOfBirth || "2002-01-01",
      email: registerData?.email || "",
      role: "ASTROLOGER",
      phoneNumber: "918989898989",
      place: "New Delhi, India",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true, // Allow form to reinitialize when Redux state changes
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(
        updateRegisterData({
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender.toLowerCase(),
          dateOfBirth: values.dateOfBirth,
          email: values.email,
          place: "New Delhi, India",
        }),
      );

      // Update current step
      dispatch(setCurrentStep(2));

      // Navigate to next step
      navigate("/professional-details");
    },
  });

  const genderOptions = [
    { label: "Male", icon: <Mars /> },
    { label: "Female", icon: <Venus /> },
    { label: "Others", icon: <Transgender /> },
  ];

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.firstName.trim() !== "" &&
    formik.values.lastName.trim() !== "" &&
    formik.values.gender !== "" &&
    formik.values.email.trim() !== "" &&
    Object.keys(formik.errors).length === 0;

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress Dots */}
          <FormStep totalSteps={6} currentStep={1} />

          {/* Heading */}
          <h1 className={styles.heading}>Let's Begin</h1>
          <p className={styles.subheading}>
            Enter Your Basic details
          </p>

          {/* First Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              First Name
            </label>
            <input
              type="text"
              placeholder="Enter here"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${styles.input} ${
                formik.touched.firstName && formik.errors.firstName
                  ? styles.inputError
                  : ""
              }`}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className={styles.errorText}>
                {formik.errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Last Name
            </label>
            <input
              type="text"
              placeholder="Enter here"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${styles.input} ${
                formik.touched.lastName && formik.errors.lastName
                  ? styles.inputError
                  : ""
              }`}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className={styles.errorText}>
                {formik.errors.lastName}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Your Identity
            </label>

            <div className={styles.genderGrid}>
              {genderOptions.map(({ label, icon }) => {
                const isActive = formik.values.gender === label;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => formik.setFieldValue("gender", label)}
                    className={`${styles.genderButton} ${
                      isActive ? styles.genderButtonActive : ""
                    }`}
                  >
                    <span className={styles.genderIcon}>
                      {icon}
                    </span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            {formik.touched.gender && formik.errors.gender && (
              <p className={styles.errorText}>
                {formik.errors.gender}
              </p>
            )}
          </div>

          {/* DOB */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Birth Date
            </label>

            <div className={styles.dateInputWrapper}>
              <input
                type="date"
                name="dateOfBirth"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${styles.dateInput} ${
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth ? styles.dateInputError : ""
                }`}
              />

              {/* Custom Calendar Icon */}
              <div className={styles.calendarIcon}>
                <Calendar size={20} />
              </div>
            </div>
            {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
              <p className={styles.errorText}>
                {formik.errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter here"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${styles.input} ${
                formik.touched.email && formik.errors.email
                  ? styles.inputError
                  : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className={styles.errorText}>
                {formik.errors.email}
              </p>
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

export default BasicDetails;
