import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createLanguagePreferencesValidation } from "../../../utils/utlis";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import styles from "./BasicForms.module.scss";
import { X, Pencil } from "lucide-react";
import { useState } from "react";

const LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Punjabi",
  "Telugu",
  "Kannada",
];

const LEVELS = ["Fluent", "Basic", "Conversational", "Native"];

const LanguagesYouSpeak = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);
  const [editingLang, setEditingLang] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    languagePreferences: createLanguagePreferencesValidation({
      minLanguages: 1,
      validProficiencyLevels: LEVELS.map(level => level.toLowerCase()),
    }),
    customLanguage: Yup.string().trim(),
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      languagePreferences: registerData?.languagePreferences || [],
      customLanguage: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true, // Allow form to reinitialize when Redux state changes
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
        ? { ...item, proficiencyLevel: level.toLowerCase() }
        : item
    );
    formik.setFieldValue("languagePreferences", updatedPreferences);
  };

  /* Check if a language is custom (not in preset list) */
  const isCustomLanguage = (langName) => !LANGUAGES.includes(langName);

  /* Remove a custom language */
  const removeLanguage = (langName) => {
    const updated = formik.values.languagePreferences.filter(
      (item) => item.languageName !== langName
    );
    formik.setFieldValue("languagePreferences", updated);
  };

  /* Start editing a custom language name */
  const startEditing = (langName) => {
    setEditingLang(langName);
    setEditValue(langName);
  };

  /* Save edited language name */
  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === editingLang) {
      setEditingLang(null);
      return;
    }
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    const alreadyExists = formik.values.languagePreferences.some(
      (item) => item.languageName === formatted
    );
    if (alreadyExists) {
      setEditingLang(null);
      return;
    }
    const updated = formik.values.languagePreferences.map((item) =>
      item.languageName === editingLang
        ? { ...item, languageName: formatted }
        : item
    );
    formik.setFieldValue("languagePreferences", updated);
    setEditingLang(null);
  };

  const selectedLanguages = formik.values.languagePreferences.map(
    (item) => item.languageName
  );

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.languagePreferences.length > 0 &&
    formik.values.languagePreferences.every(lang => lang.proficiencyLevel !== "") &&
    Object.keys(formik.errors).length === 0;

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress Dots */}
          <FormStep totalSteps={6} currentStep={3} />

          {/* Heading */}
          <h1 className={styles.heading}>
            Languages You Speak
          </h1>
          <p className={styles.subheading}>
            This helps clients connect with you easily.
          </p>

          {/* Select Languages */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Select Language
            </label>

            <div className={styles.chipContainer}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`${styles.chip} ${
                    selectedLanguages.includes(lang)
                      ? styles.chipActive
                      : ""
                  }`}
                >
                  {lang}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={styles.chipAdd}
              >
                {showCustomInput ? "− Close language" : "+ Add language"}
              </button>
            </div>

            <p className={styles.helperText}>
              *You can select more than 1.
            </p>
          </div>

          {/* Add Custom Language - toggles on button click */}
          {showCustomInput && (
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Enter Language"
                name="customLanguage"
                value={formik.values.customLanguage}
                onChange={formik.handleChange}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomLanguage())}
                autoFocus
                className={styles.input}
              />
            </div>
          )}

          {/* Proficiency */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Add Proficiency Level
            </label>

            {formik.values.languagePreferences.map((langItem) => (
              <div key={langItem.languageName} className={styles.languageItem}>
                <div className={styles.languageBadgeWrapper}>
                  {editingLang === langItem.languageName ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); saveEdit(); }
                        if (e.key === "Escape") setEditingLang(null);
                      }}
                      onBlur={saveEdit}
                      autoFocus
                      className={styles.input}
                      style={{ width: "auto", display: "inline-block", padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}
                    />
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className={styles.languageBadge}>
                        {langItem.languageName}
                      </span>
                      {isCustomLanguage(langItem.languageName) && (
                        <>
                          <Pencil
                            size={14}
                            style={{ cursor: "pointer", color: "#F75801", flexShrink: 0 }}
                            onClick={() => startEditing(langItem.languageName)}
                          />
                          <X
                            size={16}
                            style={{ cursor: "pointer", color: "#ef4444", flexShrink: 0 }}
                            onClick={() => removeLanguage(langItem.languageName)}
                          />
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className={styles.chipContainer}>
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setLevel(langItem.languageName, level)}
                      className={`${styles.chip} ${
                        langItem.proficiencyLevel === level.toLowerCase()
                          ? styles.chipActive
                          : ""
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {formik.touched.languagePreferences && formik.errors.languagePreferences && (
              <p className={styles.errorText}>
                {typeof formik.errors.languagePreferences === 'string' 
                  ? formik.errors.languagePreferences 
                  : "Please complete all language proficiency selections"}
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

export default LanguagesYouSpeak;
