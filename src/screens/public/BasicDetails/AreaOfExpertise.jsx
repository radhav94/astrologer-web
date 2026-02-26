import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createMultiSelectValidation } from "../../../utils/utlis";

const EXPERTISE_AREAS = [
  "Love & Relationships",
  "Career & Growth",
  "Wealth & Finances",
  "Health & Well-Being",
  "Self-Understanding",
  "Psychology",
];

const AreaOfExpertise = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    specialties: createMultiSelectValidation({
      fieldName: "Specialties",
      minSelections: 1,
      maxSelections: 6,
      required: true,
    }),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      specialties: [],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
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
    const newSpecialties = currentSpecialties.includes(item)
      ? currentSpecialties.filter((i) => i !== item)
      : [...currentSpecialties, item];
    
    formik.setFieldValue("specialties", newSpecialties);
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
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button 
            type="button"
            onClick={() => navigate("/verifyprofile")} 
            className="text-sm text-gray-600 underline"
          >
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">
          Area of Expertise
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Help users find you for the guidance you’re best at,
          choose the life areas you specialize in.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          {EXPERTISE_AREAS.map((item) => {
            const active = formik.values.specialties.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleSelect(item)}
                className={`
                  h-28 rounded-2xl p-4 text-left font-semibold text-sm
                  transition flex items-start
                  ${
                    active
                      ? "bg-black text-white"
                      : "bg-gray-800 text-white opacity-90"
                  }
                `}
              >
                {item}
              </button>
            );
          })}
        </div>
        {formik.touched.specialties && formik.errors.specialties && (
          <p className="text-red-500 text-xs mt-1 mb-10">{formik.errors.specialties}</p>
        )}
        {!formik.touched.specialties && (
          <div className="mb-10"></div>
        )}

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

export default AreaOfExpertise;
