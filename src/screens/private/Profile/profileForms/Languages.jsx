import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
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
  const suggestedLanguages = [
    "English",
    "Hindi",
    "Marathi",
    "Punjabi",
    "Telugu",
    "Kannada",
  ];
  const proficiencies = ["Fluent", "Basic", "Conversational", "Native"];

  const [menuOpen, setMenuOpen] = useState(null);
  const [editingLang, setEditingLang] = useState([]);
  const [newlyAdded, setNewlyAdded] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      // Already exists — just open proficiency editor, don't remove
      setEditingLang((prev) => prev.includes(lang) ? prev : [...prev, lang]);
    } else {
      // Add language with default proficiency
      formik.setFieldValue("languagePreferences", [
        ...currentPreferences,
        { languageName: lang, proficiencyLevel: "Beginner" },
      ]);
      setNewlyAdded((prev) => [...prev, lang]);
      setEditingLang((prev) => [...prev, lang]);
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

    if (alreadyExists) return; // Already exists, do nothing

    // If we're editing a previously added custom lang, rename it
    if (editingLang.length > 0 && newlyAdded.includes(editingLang[editingLang.length - 1]) && editingLang[editingLang.length - 1] !== lang) {
      const lastEditing = editingLang[editingLang.length - 1];
      const updated = currentPreferences.map((item) =>
        item.languageName === lastEditing
          ? { ...item, languageName: lang }
          : item
      );
      formik.setFieldValue("languagePreferences", updated);
      setNewlyAdded((prev) => prev.map((l) => (l === lastEditing ? lang : l)));
      setEditingLang((prev) => prev.map((l) => (l === lastEditing ? lang : l)));
      return;
    }

    // Add new language
    formik.setFieldValue("languagePreferences", [
      ...currentPreferences,
      { languageName: lang, proficiencyLevel: "Beginner" },
    ]);
    setNewlyAdded((prev) => [...prev, lang]);
    setEditingLang((prev) => [...prev, lang]);
  };

  /* Delete a language from the list */
  const deleteLanguage = (langName) => {
    const updated = formik.values.languagePreferences.filter(
      (item) => item.languageName !== langName
    );
    formik.setFieldValue("languagePreferences", updated);
    setNewlyAdded((prev) => prev.filter((l) => l !== langName));
    setEditingLang((prev) => prev.filter((l) => l !== langName));
    setMenuOpen(null);
  };

  /* Start editing — show proficiency section for that language */
  const handleEdit = (langName) => {
    setEditingLang((prev) => prev.includes(langName) ? prev : [...prev, langName]);
    setMenuOpen(null);
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
        {formik.values.languagePreferences.length > 0 && (
          <div className={styles.languageCards}>
            {formik.values.languagePreferences.map((lang) => (
              <div key={lang.languageName} className={styles.languageCard}>
                <div
                  className={styles.languageCardMenu}
                  onClick={() => setMenuOpen(menuOpen === lang.languageName ? null : lang.languageName)}
                  ref={menuOpen === lang.languageName ? menuRef : null}
                >
                  <EllipsisVertical size={20} />
                  {menuOpen === lang.languageName && (
                    <div className={styles.cardDropdown}>
                      <button
                        className={styles.cardDropdownItem}
                        onClick={(e) => { e.stopPropagation(); handleEdit(lang.languageName); }}
                      >
                        <Pencil size={16} color="#F75801" />
                        Edit
                      </button>
                      <div className={styles.cardDropdownDivider} />
                      <button
                        className={styles.cardDropdownItem}
                        onClick={(e) => { e.stopPropagation(); deleteLanguage(lang.languageName); }}
                      >
                        <Trash2 size={16} color="#ef4444" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.languageSymbol}>
                  <span className={styles.leftLetter}>{lang.languageName[0]}</span>
                  <span className={styles.rightLetter}>{lang.languageName[0]}</span>
                </div>
                <h3 className={styles.languageName}>{lang.languageName}</h3>
                <p className={styles.languageLevel}>{lang.proficiencyLevel || "—"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Select Language */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Language</label>
          <div className={styles.expertiseOptions}>
            {/* Custom languages (not in preset list) shown first */}
            {formik.values.languagePreferences
              .filter((item) => !suggestedLanguages.includes(item.languageName))
              .map((item) => (
                <Chip
                  key={item.languageName}
                  label={item.languageName}
                  selected={newlyAdded.includes(item.languageName)}
                  onClick={() => toggleLanguage(item.languageName)}
                />
              ))}
            {suggestedLanguages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                selected={newlyAdded.includes(lang)}
                onClick={() => toggleLanguage(lang)}
              />
            ))}
            <Chip
              label={showCustomInput ? "− Close" : "Add Language +"}
              selected={false}
              onClick={() => setShowCustomInput(!showCustomInput)}
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

        {/* Enter Language Input - only visible when Add Language is clicked */}
        {showCustomInput && (
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
              autoFocus
              className={styles.input}
              placeholder="Enter Language"
            />
          </div>
        )}

        {/* Add Proficiency Level - shows for all languages being edited */}
        {editingLang.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Edit Proficiency Level</label>
            {formik.values.languagePreferences
              .filter((langPref) => editingLang.includes(langPref.languageName))
              .map((langPref) => (
              <div
                key={langPref.languageName}
                className={styles.proficiencySection}
                style={{ border: "1.5px solid #F75801", borderRadius: 12, padding: 12, marginBottom: 12 }}
              >
                <h4 className={styles.label}>{langPref.languageName}</h4>
                <div className={styles.expertiseOptions}>
                  {proficiencies.map((level) => (
                    <Chip
                      key={level}
                      label={level}
                      selected={langPref.proficiencyLevel === level}
                      onClick={() => {
                        setProficiency(langPref.languageName, level);
                      }}
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
