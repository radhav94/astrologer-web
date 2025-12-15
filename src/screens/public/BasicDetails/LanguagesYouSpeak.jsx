import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [proficiency, setProficiency] = useState({});

  /* Toggle language selection */
  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };

  /* Add custom language */
  const addCustomLanguage = () => {
    if (!customLanguage.trim()) return;

    const lang =
      customLanguage.charAt(0).toUpperCase() +
      customLanguage.slice(1).toLowerCase();

    if (!selectedLanguages.includes(lang)) {
      setSelectedLanguages([...selectedLanguages, lang]);
    }

    setCustomLanguage("");
  };

  /* Set proficiency */
  const setLevel = (lang, level) => {
    setProficiency({ ...proficiency, [lang]: level });
  };

  const isValid = selectedLanguages.length > 0;

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
          value={customLanguage}
          onChange={(e) => setCustomLanguage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomLanguage()}
          className="
            w-full border rounded-xl px-4 py-4 mb-8
            focus:outline-none focus:ring-1 focus:ring-black
          "
        />

        {/* Proficiency */}
        <label className="block text-sm font-medium mb-4 text-left">
          Add Proficiency Level
        </label>

        {selectedLanguages.map((lang) => (
          <div key={lang} className="mb-6">
            <div className="text-left">
                <span className="inline-block bg-gray-700 text-white text-xs px-3 py-1 rounded-full mb-3 text-left">
                    {lang}
                </span>
            </div>


            <div className="flex flex-wrap gap-3 text-left">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setLevel(lang, level)}
                  className={`px-4 py-2 rounded-full text-sm transition
                    ${
                      proficiency[lang] === level
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
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 w-full max-w-md px-6 pb-6 bg-white">
        <button
        onClick={() => navigate("/education")}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl font-medium transition
            ${
              isValid
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
