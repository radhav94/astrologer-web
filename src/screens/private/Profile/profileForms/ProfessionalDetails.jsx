import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import Button from "../../../../components/UI/button/Button"
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Chip from "../../../../components/UI/chip/Chip";

const ProfessionalProfileDtls = () => {
  const navigate = useNavigate();
  const [experience, setExperience] = useState("3 Years");
  const [selectedExpertise, setSelectedExpertise] = useState(["Vedic", "Tarot"]);

  const expertiseOptions = [
    "Vedic",
    "Tarot",
    "Palmistry",
    "Life Coach",
    "KP",
    "Nadi",
    "Psychic",
    "Face Reading",
    "Vastu",
    "Prashana",
  ];

  const toggleExpertise = (option) => {
    if (selectedExpertise.includes(option)) {
      setSelectedExpertise(selectedExpertise.filter((item) => item !== option));
    } else {
      setSelectedExpertise([...selectedExpertise, option]);
    }
  };

  const handleNext = () => {
    // Save logic here
    navigate("/profile");
  };

  return (
    <div className={styles.basicContainer}>
      {/* Header */}
      <SectionHeader title="Professional Details" />

      {/* Form Content */}
      <div className={styles.formContent}>
        {/* Experience in Astrology */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Experience in Astrology</label>
          <div className={styles.experienceInput}>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={styles.input}
              placeholder="Enter years of experience"
            />
            <span className={styles.experienceIcon}>📖</span>
          </div>
        </div>

        {/* Area of Expertise */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Area of Expertise</label>
          <div className={styles.expertiseOptions}>
            {expertiseOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={selectedExpertise.includes(option)}
                onClick={() => toggleExpertise(option)}
              />
            ))}
          </div>
          <p className={styles.helperText}>*You can select more than 1.</p>
        </div>
      </div>

      {/* Next Button */}
      <Button onClick={handleNext}>
        Next <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default ProfessionalProfileDtls;
