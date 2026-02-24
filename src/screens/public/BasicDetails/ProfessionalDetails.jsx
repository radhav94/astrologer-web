import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createDropdownValidation, createMultiSelectValidation } from "../../../utils/utlis";

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
];

const EXPERIENCE_LIST = Array.from({ length: 51 }, (_, i) => i); // 0 to 50

const ProfessionalDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Formik setup
  const formik = useFormik({
    initialValues: {
      experience: "",
      expertise: [],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
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

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-10">

        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">
          Professional Details
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          We verify every astrologer to maintain
          <br />
          authenticity and trust.
        </p>
        {/* Experience Dropdown */}
        <div className="mb-8">
        <label className="block text-sm font-medium mb-2 text-left">
            Years of Experience in Astrology
        </label>

        <div className="relative">
            <select
            name="experience"
            value={formik.values.experience}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`
                w-full border rounded-xl px-4 py-4 pr-12 text-sm
                appearance-none bg-white
                focus:outline-none focus:ring-1
                ${
                  formik.touched.experience && formik.errors.experience
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-black"
                }
            `}
            >
            <option value="">Select experience</option>
            {EXPERIENCE_LIST.map((year) => (
                <option key={year} value={year}>
                {year} {year === 1 ? "Year" : "Years"}
                </option>
            ))}
            </select>

            {/* Gear Icon */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ⚙️
            </span>
        </div>
        {formik.touched.experience && formik.errors.experience && (
          <p className="text-red-500 text-xs mt-1 text-left">{formik.errors.experience}</p>
        )}
        </div>  


        {/* Expertise */}
        <div className="mb-10">
          <label className="block text-sm font-medium mb-3 text-left">
            Area of Expertise
          </label>

          <div className="flex flex-wrap gap-3">
            {EXPERTISE_LIST.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleExpertise(item)}
                className={`
                  px-4 py-2 rounded-full text-sm transition
                  ${
                    formik.values.expertise.includes(item)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3 text-left">
            *You can select more than 1.
          </p>
          {formik.touched.expertise && formik.errors.expertise && (
            <p className="text-red-500 text-xs mt-1 text-left">{formik.errors.expertise}</p>
          )}
        </div>

        {/* Next Button */}
        <button
          type="submit"
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
          className={`
            w-full py-3 rounded-xl font-medium transition
            ${
              formik.isValid && !formik.isSubmitting
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProfessionalDetails;
