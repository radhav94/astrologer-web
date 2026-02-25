import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { 
  nameValidationSchemas, 
  genderValidationSchema, 
  dobValidationSchema, 
  emailValidationSchema 
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
      dispatch(updateRegisterData({
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender.toLocaleLowerCase(),
        dateOfBirth: values.dob,
        email: values.email,
        place: "New Delhi, India",
      }));
      
      // Update current step
      dispatch(setCurrentStep(2));
      
      // Navigate to next step
      navigate("/professional-details");
    },
  });

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-10">

        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-1">Let’s Begin</h1>
        <p className="text-gray-500 text-sm mb-8">
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
            <p className="text-red-500 text-xs mt-1 text-left">{formik.errors.firstName}</p>
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
            <p className="text-red-500 text-xs mt-1 text-left">{formik.errors.lastName}</p>
          )}
        </div>

        {/* Gender */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-left">
            Your Identity
          </label>

          <div className="grid grid-cols-3 gap-4">
            {["Male", "Female", "Others"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => formik.setFieldValue("gender", item)}
                className={`
                  py-4 rounded-xl text-sm font-medium transition
                  ${
                    formik.values.gender === item
                      ? "bg-gray-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
          {formik.touched.gender && formik.errors.gender && (
            <p className="text-red-500 text-xs mt-1 text-left">{formik.errors.gender}</p>
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
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                formik.touched.dob && formik.errors.dob
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-black"
              }`}
            />
            <Calendar
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
          {formik.touched.dob && formik.errors.dob && (
            <p className="text-red-500 text-xs mt-1 text-left">{formik.errors.dob}</p>
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
            <p className="text-red-500 text-xs mt-1 text-left">{formik.errors.email}</p>
          )}
        </div>
        {/* Next Button */}
        <button
          type="submit"
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
          className={`
            w-full py-3 rounded-xl text-sm font-medium transition
            ${
              formik.isValid && !formik.isSubmitting
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BasicDetails;
