import { useState } from "react";
import { Button, SectionHeader, Chip } from "./ui";
import { MoreVertical, Plus } from "lucide-react";

const Languages = () => {
  const [myLanguages, setMyLanguages] = useState([
    { id: "1", name: "Hindi", level: "Beginner" },
    { id: "2", name: "English", level: "Beginner" },
    { id: "3", name: "Tamil", level: "Beginner" },
  ]);

  const [inputLang, setInputLang] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("Kannada"); // From wireframe example, looks like a label but acting as selection context or just a pre-selected proficiency for the 'Kannada' chip example.
  // Wait, looking at wireframe "Add Proficiency Level", there is a dark chip "Kannada". This implies we are setting proficiency FOR Kannada.
  // I will interpret this as: We select a language to add/edit, then select its proficiency.

  const suggestedLanguages = [
    "English",
    "Hindi",
    "Marathi",
    "Punjabi",
    "Telugu",
    "Kannada",
  ];
  const proficiencies = ["Basic", "Conversational", "Native", "Fluent"];

  const addLanguage = (name) => {
    if (!myLanguages.find((l) => l.name === name)) {
      setMyLanguages([
        ...myLanguages,
        { id: Date.now().toString(), name, level: "Basic" },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Languages" />

      <div className="flex-1 overflow-y-auto pr-2">
        {/* Current Languages List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myLanguages.map((lang) => (
            <div
              key={lang.id}
              className="bg-gray-200 rounded-xl p-4 relative group hover:bg-gray-300 transition-colors"
            >
              <button className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-400/20">
                <MoreVertical size={16} />
              </button>
              <h3 className="font-semibold text-gray-800 mt-2">{lang.name}</h3>
              <p className="text-xs text-gray-500">{lang.level}</p>
            </div>
          ))}
        </div>

        {/* Add Language Section */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-3">
            Add Language
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedLanguages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                onClick={() => setInputLang(lang)}
                selected={inputLang === lang}
              />
            ))}
            <button className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors">
              <Plus size={14} /> Add language
            </button>
          </div>

          <div className="mb-2">
            <p className="text-xs text-gray-400 mb-2">
              *You can select more than 1.
            </p>
            <input
              type="text"
              placeholder="Enter Language"
              value={inputLang}
              onChange={(e) => setInputLang(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Proficiency Section */}
        {inputLang && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Add Proficiency Level
            </label>

            <div className="mb-4">
              {/* The wireframe shows "Kannada" as a selected chip here. It indicates the language we are setting proficiency for. */}
              <span className="inline-block bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-medium mb-3">
                {inputLang}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {proficiencies.map((level) => (
                <Chip
                  key={level}
                  label={level}
                  selected={selectedProficiency === level}
                  onClick={() => setSelectedProficiency(level)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <Button
          onClick={() => {
            if (inputLang) {
              // If editing existing, update. If new, add.
              const existing = myLanguages.find((l) => l.name === inputLang);
              if (existing) {
                setMyLanguages(
                  myLanguages.map((l) =>
                    l.name === inputLang
                      ? { ...l, level: selectedProficiency }
                      : l
                  )
                );
              } else {
                setMyLanguages([
                  ...myLanguages,
                  {
                    id: Date.now().toString(),
                    name: inputLang,
                    level: selectedProficiency,
                  },
                ]);
              }
              setInputLang("");
              setSelectedProficiency("Basic");
            }
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default Languages;
