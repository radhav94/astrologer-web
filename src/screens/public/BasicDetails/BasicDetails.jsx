import { Calendar, Mars, Transgender, Venus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import {
  updateRegisterData,
  setCurrentStep,
} from "../../../reducer/registerSlice";
import Button from "../../../components/UI/button/Button";
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

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    firstName: nameValidationSchemas.firstName,
    lastName: nameValidationSchemas.lastName,
    gender: genderValidationSchema,
    dateOfBirth: dobValidationSchema,
    email: emailValidationSchema,
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      gender: "female",
      dateOfBirth: "2002-01-01",
      email: "",
      role: "ASTROLOGER",
      phoneNumber: "918989898989",
      place: "New Delhi, India",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(
        updateRegisterData({
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender.toLocaleLowerCase(),
          dateOfBirth: values.dob,
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

  return (
    <div className={styles.container}>
      <div className={styles.containerCard}>
        {/* Progress Dots */}
        <div className="flex items-center mb-8">
          {/* Active Step */}
          <div className="flex items-center">
            <span className="w-6 h-6 flex items-center justify-center rounded-full border-4 border-[#E64900]">
              <span className="w-3 h-3 bg-[#FDEFD8] rounded-full"></span>
            </span>
          </div>

          {/* Connector + Other Steps */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center">
              {/* Line */}
              <div className="w-4 h-[2px] bg-gray-300 mx-1"></div>

              {/* Dot */}
              <span className="w-4 h-4 rounded-full bg-gray-400"></span>
            </div>
          ))}
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-1 mt-8 text-left">Let’s Begin</h1>
        <p className="text-gray-500 text-sm mb-10 text-left">
          Enter Your Basic details
        </p>

        {/* First Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-left">
            First Name
          </label>
          <input
            type="text"
            placeholder="Enter here"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
              formik.touched.firstName && formik.errors.firstName
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-black"
            }`}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {formik.errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-left">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Enter here"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
              formik.touched.lastName && formik.errors.lastName
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-black"
            }`}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {formik.errors.lastName}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-left">
            Your Identity
          </label>

          <div className="grid grid-cols-3 gap-6">
            {genderOptions.map(({ label, icon }) => {
              const isActive = formik.values.gender === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => formik.setFieldValue("gender", label)}
                  className={`
          h-24 rounded-2xl
          flex flex-col items-center justify-center gap-2
          text-sm font-medium
          transition-all duration-200
          border
          ${
            isActive
              ? "bg-gradient-to-b from-[#FF6A00] to-[#E64900] text-white border-[#E64900] shadow-md"
              : "bg-[#F5EDE4] text-black border-[#F5B98E] hover:bg-[#FBE5D2]"
          }
        `}
                >
                  <span className={isActive ? "text-white" : "text-black"}>
                    {icon}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {formik.touched.gender && formik.errors.gender && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {formik.errors.gender}
            </p>
          )}
        </div>

        {/* DOB */}
        <div className="mb-10">
          <label className="block text-sm font-medium mb-2 text-left">
            Birth Date
          </label>

          <div className="relative">
            <input
              type="date"
              name="dob"
              value={formik.values.dob}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`
      w-full h-14
      rounded-2xl
      border border-gray-300
      bg-white
      px-4 pr-12
      text-sm text-gray-700
      focus:outline-none focus:border-[#F75801]
      transition-colors duration-200
      appearance-none
      ${formik.touched.dob && formik.errors.dob ? "border-red-500" : ""}
    `}
            />

            {/* Custom Calendar Icon */}
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#F75801]">
              <Calendar size={20} />
            </div>
          </div>
          {formik.touched.dob && formik.errors.dob && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {formik.errors.dob}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-left">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter here"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-black"
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {formik.errors.email}
            </p>
          )}
        </div>
        {/* Next Button */}
        <Button
          type="submit"
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
          className={`
            w-full py-3 rounded-full text-sm font-medium transition
            ${
              formik.isValid && !formik.isSubmitting
                ? "bg-gradient-to-b from-[#FF6A00] to-[#E64900] text-white"
                : "text-white cursor-not-allowed opacity-50"
            }
          `}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BasicDetails;
