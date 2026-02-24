import { ChevronDown, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createEducationValidation } from "../../../utils/utlis";

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate",
  "Postgraduate",
  "Prefer not to say",
];

const Education = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    education: createEducationValidation({
      required: true,
      minEntries: 1,
      universityRequired: false,
      certificateRequired: false,
    }),
    educationShowOnProfile: Yup.boolean(),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      education: [
        {
          qualification: "",
          universityName: "",
          certificateImgUrl: "dummy-url-for-now",
        },
      ],
      educationShowOnProfile: false,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        education: values.education,
        educationShowOnProfile: values.educationShowOnProfile,
      }));
      
      // Update current step
      dispatch(setCurrentStep(5));
      
      // Navigate to next step
      navigate("/achievements");
    },
  });

  const handleQualificationChange = (value) => {
    formik.setFieldValue("education.0.qualification", value);
  };

  const handleUniversityChange = (e) => {
    formik.setFieldValue("education.0.universityName", e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just store dummy URL as per requirements
      formik.setFieldValue("education.0.certificateImgUrl", "dummy-url-for-now");
    }
  };

  const handleToggleProfile = () => {
    formik.setFieldValue("educationShowOnProfile", !formik.values.educationShowOnProfile);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center text-left">
      <div className="w-full max-w-md px-6 pt-10 pb-10 flex flex-col">

        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button 
          type="button"
          onClick={() => navigate("/achievements")}
          className="text-sm text-gray-600 underline"
          >
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">Education</h1>
        <p className="text-gray-500 text-sm mb-8">
          What’s the highest level of education you have attained.
        </p>

        {/* Education Level */}
        <label className="block text-sm font-medium mb-3">
          Level of Education
        </label>

        <div className="flex flex-wrap gap-3 mb-2">
          {EDUCATION_LEVELS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleQualificationChange(item)}
              className={`
                px-4 py-2 rounded-full text-sm transition
                ${
                  formik.values.education[0].qualification === item
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>
        {formik.touched.education?.[0]?.qualification && formik.errors.education?.[0]?.qualification && (
          <p className="text-red-500 text-xs mt-1 mb-6">{formik.errors.education[0].qualification}</p>
        )}
        {!formik.touched.education?.[0]?.qualification && (
          <div className="mb-8"></div>
        )}

        {/* University */}
        <label className="block text-sm font-medium mb-2">
          Select University <span className="italic text-gray-400">(if any)</span>
        </label>

        <div className="relative mb-8">
          <select
            name="education.0.universityName"
            value={formik.values.education[0].universityName}
            onChange={handleUniversityChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none"
          >
            <option value="">Select</option>
            <option>Delhi University</option>
            <option>Mumbai University</option>
            <option>Pune University</option>
            <option>Other</option>
          </select>

          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Certificate Upload */}
        <label className="block text-sm font-medium mb-2">
          Attach Certificate <span className="italic text-gray-400">(if any)</span>
        </label>

        <label className="border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer mb-8">
          <span className="text-sm text-gray-500">
            {formik.values.education[0].certificateImgUrl !== "dummy-url-for-now" 
              ? "Certificate attached" 
              : "Add file (.jpg, .png, .pdf)"}
          </span>
          <Upload size={18} className="text-gray-500" />
          <input
            type="file"
            accept=".jpg,.png,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Display on Profile */}
        <div className="flex items-center gap-3 mb-10">
          <button
            type="button"
            onClick={handleToggleProfile}
            className={`
              w-12 h-7 rounded-full flex items-center px-1 transition
              ${formik.values.educationShowOnProfile ? "bg-black justify-end" : "bg-gray-300"}
            `}
          >
            <span className="w-5 h-5 bg-white rounded-full" />
          </button>

          <span className="text-sm font-medium">Display on Profile</span>
        </div>

        {/* Next Button */}
        <button
          type="submit"
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
          className={`
            w-full py-3 rounded-xl font-medium transition mt-auto
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

export default Education;
