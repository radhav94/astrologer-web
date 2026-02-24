import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createLanguagePreferencesValidation } from "../../../utils/utlis";

const LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Punjabi",
  "Telugu",
  "Kannada",
];

const LEVELS = ["Basic", "Conversational", "Native", "Fluent"];

const LanguagesYouSpeak = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    languagePreferences: createLanguagePreferencesValidation({
      minLanguages: 1,
      validProficiencyLevels: LEVELS,
    }),
    customLanguage: Yup.string().trim(),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      languagePreferences: [],
      customLanguage: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        languagePreferences: values.languagePreferences,
      }));
      
      // Update current step
      dispatch(setCurrentStep(4));
      
      // Navigate to next step
      navigate("/education");
    },
  });

  /* Toggle language selection */
  const toggleLanguage = (lang) => {
    const currentPreferences = formik.values.languagePreferences;
    const existingIndex = currentPreferences.findIndex(
      (item) => item.languageName === lang
    );

    if (existingIndex !== -1) {
      // Remove language
      const newPreferences = currentPreferences.filter((_, idx) => idx !== existingIndex);
      formik.setFieldValue("languagePreferences", newPreferences);
    } else {
      // Add language with empty proficiency
      formik.setFieldValue("languagePreferences", [
        ...currentPreferences,
        { languageName: lang, proficiencyLevel: "" },
      ]);
    }
  };

  /* Add custom language */
  const addCustomLanguage = () => {
    const customLang = formik.values.customLanguage.trim();
    if (!customLang) return;

    const lang =
      customLang.charAt(0).toUpperCase() +
      customLang.slice(1).toLowerCase();

    const currentPreferences = formik.values.languagePreferences;
    const alreadyExists = currentPreferences.some(
      (item) => item.languageName === lang
    );

    if (!alreadyExists) {
      formik.setFieldValue("languagePreferences", [
        ...currentPreferences,
        { languageName: lang, proficiencyLevel: "" },
      ]);
    }

    formik.setFieldValue("customLanguage", "");
  };

  /* Set proficiency level for a language */
  const setLevel = (lang, level) => {
    const currentPreferences = formik.values.languagePreferences;
    const updatedPreferences = currentPreferences.map((item) =>
      item.languageName === lang
        ? { ...item, proficiencyLevel: level }
        : item
    );
    formik.setFieldValue("languagePreferences", updatedPreferences);
  };

  const selectedLanguages = formik.values.languagePreferences.map(
    (item) => item.languageName
  );

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-24">

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[...Array(7)].map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === 2 ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2 text-left">
          Languages You Speak
        </h1>
        <p className="text-gray-500 text-sm mb-8 text-left">
          This helps clients connect with you easily.
        </p>

        {/* Select Languages */}
        <label className="block text-sm font-medium mb-3 text-left">
          Select Language
        </label>

        <div className="flex flex-wrap gap-3 mb-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-full text-sm transition
                ${
                  selectedLanguages.includes(lang)
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              {lang}
            </button>
          ))}

          <button
            type="button"
            onClick={addCustomLanguage}
            className="px-4 py-2 rounded-full bg-gray-600 text-white text-sm"
          >
            + Add language
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4 text-left">
          *You can select more than 1.
        </p>

        {/* Add Custom Language */}
        <input
          type="text"
          placeholder="Enter Language"
          name="customLanguage"
          value={formik.values.customLanguage}
          onChange={formik.handleChange}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomLanguage())}
          className="
            w-full border rounded-xl px-4 py-4 mb-8
            focus:outline-none focus:ring-1 focus:ring-black
          "
        />

        {/* Proficiency */}
        <label className="block text-sm font-medium mb-4 text-left">
          Add Proficiency Level
        </label>

        {formik.values.languagePreferences.map((langItem) => (
          <div key={langItem.languageName} className="mb-6">
            <div className="text-left">
                <span className="inline-block bg-gray-700 text-white text-xs px-3 py-1 rounded-full mb-3 text-left">
                    {langItem.languageName}
                </span>
            </div>

            <div className="flex flex-wrap gap-3 text-left">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setLevel(langItem.languageName, level)}
                  className={`px-4 py-2 rounded-full text-sm transition
                    ${
                      langItem.proficiencyLevel === level
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}

        {formik.touched.languagePreferences && formik.errors.languagePreferences && (
          <p className="text-red-500 text-xs mt-2 text-left">
            {typeof formik.errors.languagePreferences === 'string' 
              ? formik.errors.languagePreferences 
              : "Please complete all language proficiency selections"}
          </p>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 w-full max-w-md px-6 pb-6 bg-white">
        <button
          type="submit"
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
          className={`w-full py-4 rounded-xl font-medium transition
            ${
              formik.isValid && !formik.isSubmitting
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LanguagesYouSpeak;
