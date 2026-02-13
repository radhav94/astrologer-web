import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import { AppImages } from "../../../../utils/appImages";
import { SectionHeader, Chip, Button } from "./ui";

const Languages = () => {
  const navigate = useNavigate();
  const [myLanguages, setMyLanguages] = useState([
    { id: "1", name: "Hindi", level: "Beginner", symbol: AppImages.Letter1 },
    { id: "2", name: "English", level: "Beginner", symbol: AppImages.Letter1 },
    { id: "3", name: "Tamil", level: "Beginner", symbol: AppImages.Letter1 },
  ]);

  const [selectedLanguages, setSelectedLanguages] = useState(["English", "Hindi"]);
  const [inputLang, setInputLang] = useState("");
  const [proficiencyLevels, setProficiencyLevels] = useState({
    English: "Basic",
    Hindi: "Basic",
  });

  const suggestedLanguages = [
    "English",
    "Hindi",
    "Marathi",
    "Punjabi",
    "Telugu",
    "Kannada",
  ];
  const proficiencies = ["Basic", "Conversational", "Native", "Fluent"];

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      const newLevels = { ...proficiencyLevels };
      delete newLevels[lang];
      setProficiencyLevels(newLevels);
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
      setProficiencyLevels({ ...proficiencyLevels, [lang]: "Basic" });
    }
  };

  const setProficiency = (lang, level) => {
    setProficiencyLevels({ ...proficiencyLevels, [lang]: level });
  };

  const handleSave = () => {
    // Save logic here
    navigate("/profile");
  };

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
              <button className={styles.languageCardMenu}>⋮</button>
              <div className={styles.languageSymbol}>
                <img src={lang.symbol} alt="symbol" />
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
              onClick={() => {}}
            />
          </div>
          <p className={styles.helperText}>*You can select more than 1.</p>
        </div>

        {/* Enter Language Input */}
        <div className={styles.formGroup}>
          <input
            type="text"
            value={inputLang}
            onChange={(e) => setInputLang(e.target.value)}
            className={styles.input}
            placeholder="Enter Language"
          />
        </div>

        {/* Add Proficiency Level */}
        {selectedLanguages.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Add Proficiency Level</label>
            {selectedLanguages.map((lang) => (
              <div key={lang} className={styles.proficiencySection}>
                <h4 className={styles.proficiencyLanguage}>{lang}</h4>
                <div className={styles.expertiseOptions}>
                  {proficiencies.map((level) => (
                    <Chip
                      key={level}
                      label={level}
                      selected={proficiencyLevels[lang] === level}
                      onClick={() => setProficiency(lang, level)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <Button onClick={handleSave}>
        Save <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default Languages;
