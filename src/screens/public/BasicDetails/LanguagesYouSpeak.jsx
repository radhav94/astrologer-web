import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createLanguagePreferencesValidation } from "../../../utils/utlis";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import styles from "./BasicForms.module.scss";
import { X } from "lucide-react";
import { useState } from "react";

const LANGUAGES = ["English", "Hindi", "Marathi", "Punjabi", "Telugu", "Kannada"];
const LEVELS = ["Basic", "Conversational", "Native", "Fluent"];

const LanguagesYouSpeak = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);
  const [addMode, setAddMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customProficiency, setCustomProficiency] = useState("");
  const [customError, setCustomError] = useState("");

  const validationSchema = Yup.object().shape({
    languagePreferences: createLanguagePreferencesValidation({
      minLanguages: 1,
      validProficiencyLevels: LEVELS.map((l) => l.toLowerCase()),
    }),
  });

  const formik = useFormik({
    initialValues: {
      languagePreferences: registerData?.languagePreferences || [],
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      dispatch(updateRegisterData({ languagePreferences: values.languagePreferences }));
      dispatch(setCurrentStep(4));
      navigate("/education");
    },
  });

  const selectedLanguages = formik.values.languagePreferences.map((i) => i.languageName);
  const isCustom = (name) => !LANGUAGES.includes(name);

  const toggleLanguage = (lang) => {
    const prefs = formik.values.languagePreferences;
    const idx = prefs.findIndex((i) => i.languageName === lang);
    if (idx !== -1) {
      formik.setFieldValue("languagePreferences", prefs.filter((_, i) => i !== idx));
    } else {
      formik.setFieldValue("languagePreferences", [...prefs, { languageName: lang, proficiencyLevel: "" }]);
    }
  };

  const setLevel = (lang, level) => {
    const updated = formik.values.languagePreferences.map((i) =>
      i.languageName === lang ? { ...i, proficiencyLevel: level.toLowerCase() } : i
    );
    formik.setFieldValue("languagePreferences", updated);
  };

  const handleAddCustom = () => {
    setCustomError("");
    if (!customName.trim()) { setCustomError("Please enter a language name"); return; }
    if (!customProficiency) { setCustomError("Please select a proficiency level"); return; }
    const formatted = customName.trim().charAt(0).toUpperCase() + customName.trim().slice(1).toLowerCase();
    const exists = formik.values.languagePreferences.some((i) => i.languageName.toLowerCase() === formatted.toLowerCase());
    if (exists) { setCustomError(`"${formatted}" already exists`); return; }
    formik.setFieldValue("languagePreferences", [
      ...formik.values.languagePreferences,
      { languageName: formatted, proficiencyLevel: customProficiency.toLowerCase() },
    ]);
    setCustomName("");
    setCustomProficiency("");
    setAddMode(false);
  };

  const isFormValid =
    formik.values.languagePreferences.length > 0 &&
    formik.values.languagePreferences.every((l) => l.proficiencyLevel !== "") &&
    Object.keys(formik.errors).length === 0;

  // ─── ADD LANGUAGE SCREEN (Screen 3) ───
  if (addMode) {
    return (
      <div className={styles.formLayoutWrapper}>
        <div className={styles.formLayoutContainer}>
          <div className={styles.formLayoutContent}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => { setAddMode(false); setCustomName(""); setCustomProficiency(""); setCustomError(""); }}
                style={{ background: "none", border: "1.5px solid #F75801", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              >
                <span style={{ color: "#F75801", fontSize: 18, lineHeight: 1 }}>‹</span>
              </button>
            </div>
            <FormStep totalSteps={8} currentStep={3} />
            <h1 className={styles.heading}>Languages You Speak</h1>
            <p className={styles.subheading}>We verify every astrologer to maintain authenticity and trust.</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Enter your language</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => { setCustomName(e.target.value); setCustomError(""); }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
                autoFocus
                className={styles.input}
                placeholder="Bengali"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Add Proficiency Level</label>
              <div className={styles.chipContainer}>
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => { setCustomProficiency(level); setCustomError(""); }}
                    className={`${styles.chip} ${customProficiency === level ? styles.chipActive : ""}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {customError && <p className={styles.errorText}>{customError}</p>}
          </div>

          <div className={styles.formLayoutFooter}>
            <Button
              type="button"
              onClick={handleAddCustom}
              className={styles.formButton}
            >
              Add Language
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN SCREEN (Screen 1, 2, 4) ───
  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          <FormStep totalSteps={8} currentStep={3} />
          <h1 className={styles.heading}>Languages You Speak</h1>
          <p className={styles.subheading}>We verify every astrologer to maintain authenticity and trust.</p>

          {/* Select Language */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Language</label>
            <div className={styles.chipContainer}>
              {/* Custom languages with X */}
              {formik.values.languagePreferences.filter((i) => isCustom(i.languageName)).map((item) => (
                <button
                  key={item.languageName}
                  type="button"
                  className={`${styles.chip} ${styles.chipActive}`}
                  onClick={() => toggleLanguage(item.languageName)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  {item.languageName}
                  <X size={14} />
                </button>
              ))}

              {/* Preset chips */}
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`${styles.chip} ${selectedLanguages.includes(lang) ? styles.chipActive : ""}`}
                >
                  {lang}
                </button>
              ))}

              <button type="button" onClick={() => setAddMode(true)} className={styles.chipAdd}>
                Add Language  +
              </button>
            </div>
            <p className={styles.helperText}>*You can select more than 1.</p>
          </div>

          {/* Proficiency — only when languages are selected */}
          {formik.values.languagePreferences.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Add Proficiency Level</label>
              {formik.values.languagePreferences.map((langItem) => (
                <div key={langItem.languageName} className={styles.languageItem}>
                  <div className={styles.languageBadgeWrapper}>
                    <span className={styles.languageBadge}>{langItem.languageName}</span>
                  </div>
                  <div className={styles.chipContainer}>
                    {LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setLevel(langItem.languageName, level)}
                        className={`${styles.chip} ${langItem.proficiencyLevel === level.toLowerCase() ? styles.chipActive : ""}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {formik.touched.languagePreferences && formik.errors.languagePreferences && (
                <p className={styles.errorText}>
                  {typeof formik.errors.languagePreferences === "string"
                    ? formik.errors.languagePreferences
                    : "Please complete all language proficiency selections"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.formLayoutFooter}>
          <Button
            type="submit"
            onClick={formik.handleSubmit}
            disabled={!isFormValid || formik.isSubmitting}
            className={`${styles.formButton} ${!isFormValid || formik.isSubmitting ? styles.formButtonDisabled : ""}`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguagesYouSpeak;
