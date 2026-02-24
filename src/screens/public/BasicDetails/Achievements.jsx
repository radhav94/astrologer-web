import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createAchievementsValidation } from "../../../utils/utlis";

const Achievements = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    achievements: createAchievementsValidation({
      required: true,
      minEntries: 1,
      minLength: 50,
      maxLength: 500,
      certificateRequired: false,
    }),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      achievements: [
        {
          achievementName: "",
          achievementImgUrl: "dummy-url-for-now",
          display: false,
        },
      ],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        achievements: values.achievements,
      }));
      
      // Update current step
      dispatch(setCurrentStep(6));
      
      // Navigate to next step
      navigate("/areaofexpertise");
    },
  });

  const handleDescriptionChange = (e) => {
    formik.setFieldValue("achievements.0.achievementName", e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just store dummy URL as per requirements
      formik.setFieldValue("achievements.0.achievementImgUrl", "dummy-url-for-now");
    }
  };

  const handleToggleDisplay = () => {
    formik.setFieldValue("achievements.0.display", !formik.values.achievements[0].display);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center text-left">
      <div className="w-full max-w-md px-6 pt-10 pb-10 flex flex-col">

        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button 
            type="button"
            onClick={() => navigate("/areaofexpertise")} 
            className="text-sm text-gray-600 underline"
          >
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-gray-500 text-sm mb-8">
          Show your milestones, recognitions and contributions.
          <br />
          This helps clients know your depth and experience.
        </p>

        {/* Textarea */}
        <textarea
          rows={5}
          name="achievements.0.achievementName"
          value={formik.values.achievements[0].achievementName}
          onChange={handleDescriptionChange}
          onBlur={formik.handleBlur}
          placeholder="Tell us about your Achievements..."
          className={`
            w-full border rounded-xl px-4 py-3 text-sm resize-none
            focus:outline-none focus:ring-1
            ${
              formik.touched.achievements?.[0]?.achievementName && formik.errors.achievements?.[0]?.achievementName
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-black"
            }
          `}
        />
        {formik.touched.achievements?.[0]?.achievementName && formik.errors.achievements?.[0]?.achievementName && (
          <p className="text-red-500 text-xs mt-1 mb-6">{formik.errors.achievements[0].achievementName}</p>
        )}
        {!formik.touched.achievements?.[0]?.achievementName && (
          <div className="mb-6"></div>
        )}

        {/* File Upload */}
        <label className="border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer mb-8">
          <span className="text-sm text-gray-500">
            {formik.values.achievements[0].achievementImgUrl !== "dummy-url-for-now"
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

        {/* Display on Profile Toggle */}
        <div className="flex items-center gap-3 mb-10">
          <button
            type="button"
            onClick={handleToggleDisplay}
            className={`
              w-12 h-7 rounded-full flex items-center px-1 transition
              ${formik.values.achievements[0].display ? "bg-black justify-end" : "bg-gray-300"}
            `}
          >
            <span className="w-5 h-5 bg-white rounded-full" />
          </button>

          <span className="text-sm font-medium">
            Display on Profile
          </span>
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

export default Achievements;
