import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import Button from "../../../../components/UI/button/Button";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Chip from "../../../../components/UI/chip/Chip";
import { createLanguagePreferencesValidation } from "../../../../utils/utils";
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
    "Odia"
  ];
  const proficiencies = ["Fluent", "Basic", "Conversational", "Native"];

  const [menuOpen, setMenuOpen] = useState(null);
  const [editingLang, setEditingLang] = useState(null);
  const [newlyAdded, setNewlyAdded] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftProficiency, setDraftProficiency] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
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
      let finalPreferences = [...values.languagePreferences];

      // Add draft custom language if present
      if (draftName.trim() && showCustomInput && !editingLang) {
        if (!draftProficiency) {
          toast.error("Please select a proficiency level");
          return;
        }
        const formatted = draftName.trim().charAt(0).toUpperCase() + draftName.trim().slice(1).toLowerCase();
        const alreadyExists = finalPreferences.some((item) => item.languageName.toLowerCase() === formatted.toLowerCase());
        if (alreadyExists) {
          toast.error(`"${formatted}" already exists`);
          return;
        }
        finalPreferences.push({ languageName: formatted, proficiencyLevel: draftProficiency });
      }

      // Apply pending edit rename
      if (editingLang && editValue.trim()) {
        const formatted = editValue.trim().charAt(0).toUpperCase() + editValue.trim().slice(1).toLowerCase();
        if (formatted !== editingLang) {
          const alreadyExists = finalPreferences.some((item) => item.languageName.toLowerCase() === formatted.toLowerCase() && item.languageName !== editingLang);
          if (!alreadyExists) {
            finalPreferences = finalPreferences.map((item) =>
              item.languageName === editingLang
                ? { ...item, languageName: formatted }
                : item
            );
          }
        }
      }

      await setAstroEditProfile({
        id: astrologerId,
        languagePreferences: finalPreferences,
      }).unwrap();

      toast.success("Languages updated successfully");
      setEditingLang(null);
      setEditValue("");
      setDraftName("");
      setDraftProficiency("");
      setShowCustomInput(false);
      setDuplicateError("");
      setNewlyAdded([]);
      // Stay on same page, refresh after toast is visible
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        // Handle error
        console.error("Failed to update languages:", error);
        toast.error(error?.data?.message || "Failed to update languages. Please try again.");
      }
    },
  });

  const toggleLanguage = (lang) => {
    // Don't add to formik — just set as draft, card will be created on Save
    setDraftName(lang);
    setDraftProficiency("");
    setDuplicateError("");
    setEditingLang(null);
    setShowCustomInput(true);
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

  /* Delete a language from the list and update API */
  const deleteLanguage = async (langName) => {
    const updated = formik.values.languagePreferences.filter(
      (item) => item.languageName !== langName
    );
    formik.setFieldValue("languagePreferences", updated);
    setNewlyAdded((prev) => prev.filter((l) => l !== langName));
    if (editingLang === langName) setEditingLang(null);
    setMenuOpen(null);

    try {
      await setAstroEditProfile({
        id: astrologerId,
        languagePreferences: updated,
      }).unwrap();
      toast.success("Language deleted successfully");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Failed to delete language:", error);
      toast.error(error?.data?.message || "Failed to delete language");
    }
  };

  const handleEdit = (langName) => {
    setEditingLang(langName);
    setEditValue(langName);
    setShowCustomInput(true);
    setMenuOpen(null);
  };

  /* Save edited language name */
  const saveEditName = () => {
    const trimmed = editValue.trim();
    if (!trimmed || !editingLang) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (formatted === editingLang) return; // no change
    const currentPreferences = formik.values.languagePreferences;
    const alreadyExists = currentPreferences.some(
      (item) => item.languageName === formatted
    );
    if (alreadyExists) return;
    const updated = currentPreferences.map((item) =>
      item.languageName === editingLang
        ? { ...item, languageName: formatted }
        : item
    );
    formik.setFieldValue("languagePreferences", updated).then(() => {
      setNewlyAdded((prev) => prev.map((l) => (l === editingLang ? formatted : l)));
      setEditingLang(formatted);
      setEditValue(formatted);
    });
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
            {/* Custom languages added in this session shown first */}
            {newlyAdded
              .filter((lang) => !suggestedLanguages.includes(lang))
              .map((lang) => {
                return (
                  <Chip
                    key={lang}
                    label={lang}
                    selected={true}
                    onClick={() => toggleLanguage(lang)}
                  />
                );
              })}
            {suggestedLanguages
              .filter((lang) => !selectedLanguages.includes(lang))
              .map((lang) => {
              const isSelected = newlyAdded.includes(lang) || draftName === lang;
              return (
                <Chip
                  key={lang}
                  label={lang}
                  selected={isSelected}
                  onClick={() => toggleLanguage(lang)}
                  {...(!isSelected && { style: { backgroundColor: "#ffffff" } })}
                />
              );
            })}
            <Chip
              label="Add Language +"
              selected={false}
              onClick={() => setShowCustomInput(!showCustomInput)}
            />
          </div>
          {/* <p className={styles.helperText}>*You can select more than 1.</p> */}
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
              value={editingLang ? editValue : draftName}
              onChange={(e) => {
                const val = e.target.value;
                setDuplicateError("");
                if (editingLang) {
                  setEditValue(val);
                } else {
                  setDraftName(val);
                  // Check duplicate
                  const trimmed = val.trim();
                  if (trimmed) {
                    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
                    const alreadyExists = formik.values.languagePreferences.some(
                      (item) => item.languageName.toLowerCase() === formatted.toLowerCase()
                    );
                    if (alreadyExists) {
                      setDuplicateError(`"${formatted}" already exists`);
                    }
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (editingLang) saveEditName();
                }
              }}
              autoFocus
              className={styles.input}
              placeholder="Enter Language"
            />
            {duplicateError && <p className={styles.errorText}>{duplicateError}</p>}
          </div>
        )}

        {/* Proficiency for draft custom language (not yet saved) */}
        {showCustomInput && draftName.trim() && !duplicateError && !editingLang && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Proficiency Level</label>
            <div
              className={styles.proficiencySection}
              style={{ border: "1.5px solid #F75801", borderRadius: 12, padding: 12, marginBottom: 12 }}
            >
              <div className={styles.expertiseOptions}>
                {proficiencies.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    selected={draftProficiency === level}
                    onClick={() => setDraftProficiency(level)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Proficiency Level - only for existing card being edited */}
        {editingLang && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Edit Proficiency Level</label>
            {formik.values.languagePreferences
              .filter((langPref) => langPref.languageName === editingLang)
              .map((langPref) => (
              <div
                key={langPref.languageName}
                className={styles.proficiencySection}
                style={{ border: "1.5px solid #F75801", borderRadius: 12, padding: 12, marginBottom: 12 }}
              >
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

      {/* Save Button - only show when user has made changes */}
      {(editingLang || newlyAdded.length > 0 || draftName.trim()) && (
        <Button 
          type="submit"
          onClick={formik.handleSubmit}
          className={styles.saveButton}
          disabled={isButtonDisabled}
        >
          {isUpdating ? "Saving..." : "Save"} <Icons.ChevronRight size={20} />
        </Button>
      )}
    </div>
  );
};

export default Languages;
