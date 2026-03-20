import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EllipsisVertical } from "lucide-react";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import { AppImages } from "../../../../utils/appImages";
import Button from "../../../../components/UI/button/Button";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Chip from "../../../../components/UI/chip/Chip";
import { createLanguagePreferencesValidation } from "../../../../utils/utlis";
import { useSetAstroEditProfileMutation } from "../../../../redux/profileApi/profileApi";
import toast from "../../../../components/toast";
import { useSelector } from "react-redux";

const Languages = () => {
  const navigate = useNavigate();
  const [setAstroEditProfile, { isLoading: isUpdating }] = useSetAstroEditProfileMutation();
  
  // Get astrologer details from Redux state
  const astrologerDetails = useSelector((state) => state.register.astrologerDetails);
  const astrologerIdFromRedux = useSelector((state) => state.register.astrologerId);
  
  // Fallback to localStorage if Redux doesn't have the data
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details") || "{}"
  );
  
  const astrologerId = astrologerIdFromRedux || userData?._id;
  
  // Use Redux state as primary source for prefilling form
  const existingData = astrologerDetails || userData;
  
  // Get existing language preferences from Redux
  const existingLanguages = existingData?.languagePreferences || [];
  
  // Static language cards for UI design purposes only
  const [myLanguages] = useState([
    { id: "1", name: "Hindi", level: "Basic", symbol: AppImages.Letter1 },
    { id: "2", name: "English", level: "Basic", symbol: AppImages.Letter1 },
    { id: "3", name: "Tamil", level: "Basic", symbol: AppImages.Letter1 },
  ]);

  const suggestedLanguages = [
    "English",
    "Hindi",
    "Marathi",
    "Punjabi",
    "Telugu",
    "Kannada",
  ];
  const proficiencies = ["Fluent", "Basic", "Conversational", "Native"];

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    languagePreferences: createLanguagePreferencesValidation({
      minLanguages: 1,
      validProficiencyLevels: proficiencies,
    }),
    customLanguage: Yup.string().trim(),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      languagePreferences: existingLanguages,
      customLanguage: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {

      await setAstroEditProfile({
        id: astrologerId,
        languagePreferences: values.languagePreferences,
      }).unwrap();

      toast.success("Languages updated successfully");

      navigate("/profile");
    } catch (error) {
        // Handle error
        console.error("Failed to update languages:", error);
        toast.error(error?.data?.message || "Failed to update languages. Please try again.");
      }
    },
  });

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
      // Add language with default proficiency
      formik.setFieldValue("languagePreferences", [
        ...currentPreferences,
        { languageName: lang, proficiencyLevel: "Beginner" },
      ]);
    }
  };

  const setProficiency = (lang, level) => {
    const currentPreferences = formik.values.languagePreferences;
    const updatedPreferences = currentPreferences.map((item) =>
      item.languageName === lang
        ? { ...item, proficiencyLevel: level }
        : item
    );
    formik.setFieldValue("languagePreferences", updatedPreferences);
  };

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
        { languageName: lang, proficiencyLevel: "Beginner" },
      ]);
      formik.setFieldValue("customLanguage", "");
    }
  };

  const selectedLanguages = formik.values.languagePreferences.map(
    (item) => item.languageName
  );

  // Check if all required fields are filled and valid
  const isFormValid =
    formik.values.languagePreferences.length > 0 &&
    formik.isValid;

  const isButtonDisabled = !isFormValid || formik.isSubmitting || isUpdating;

  return (
    <div className={styles.basicContainer}>
      {/* Header */}
      <SectionHeader title="Languages" />

      {/* Form Content */}
      <div className={styles.formContent}>
        {/* Current Languages Cards */}
        <div className={styles.languageCards}>
          {myLanguages.map((lang) => (
            <div key={lang.id} className={styles.languageCard}>
              <EllipsisVertical size={35} className={styles.languageCardMenu} />
              <div className={styles.languageSymbol}>
                <span className={styles.leftLetter}>{lang.name[0]}</span>
                <span className={styles.rightLetter}>{lang.name[0]}</span>
              </div>
              <h3 className={styles.languageName}>{lang.name}</h3>
              <p className={styles.languageLevel}>{lang.level}</p>
            </div>
          ))}
        </div>

        {/* Select Language */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Language</label>
          <div className={styles.expertiseOptions}>
            {suggestedLanguages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                selected={selectedLanguages.includes(lang)}
                onClick={() => toggleLanguage(lang)}
              />
            ))}
            <Chip
              label="Add Language +"
              selected={false}
              onClick={addCustomLanguage}
            />
          </div>
          <p className={styles.helperText}>*You can select more than 1.</p>
          {formik.touched.languagePreferences && formik.errors.languagePreferences && (
            <p className={styles.errorText}>
              {typeof formik.errors.languagePreferences === 'string' 
                ? formik.errors.languagePreferences 
                : 'Please select at least one language'}
            </p>
          )}
        </div>

        {/* Enter Language Input */}
        <div className={styles.formGroup}>
          <input
            type="text"
            name="customLanguage"
            value={formik.values.customLanguage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomLanguage();
              }
            }}
            className={styles.input}
            placeholder="Enter Language"
          />
        </div>

        {/* Add Proficiency Level */}
        {selectedLanguages.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Add Proficiency Level</label>
            {formik.values.languagePreferences.map((langPref) => (
              <div key={langPref.languageName} className={styles.proficiencySection}>
                <h4 className={styles.label}>{langPref.languageName}</h4>
                <div className={styles.expertiseOptions}>
                  {proficiencies.map((level) => (
                    <Chip
                      key={level}
                      label={level}
                      selected={langPref.proficiencyLevel === level}
                      onClick={() => setProficiency(langPref.languageName, level)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <Button 
        type="submit"
        onClick={formik.handleSubmit}
        className={styles.saveButton}
        disabled={isButtonDisabled}
      >
        {isUpdating ? "Saving..." : "Save"} <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default Languages;
