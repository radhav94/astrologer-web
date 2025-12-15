import { useState } from "react";
import { ChevronDown, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate",
  "Postgraduate",
  "Prefer not to say",
];

const Education = () => {
  const navigate = useNavigate();

  const [level, setLevel] = useState("");
  const [university, setUniversity] = useState("");
  const [file, setFile] = useState(null);
  const [showProfile, setShowProfile] = useState(true);

  const isValid = level !== "";

  return (
    <div className="min-h-screen bg-white flex justify-center text-left">
      <div className="w-full max-w-md px-6 pt-10 pb-10 flex flex-col">

        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button 
          onClick={() => navigate("/achievements")}
          className="text-sm text-gray-600 underline"
          >
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">Education</h1>
        <p className="text-gray-500 text-sm mb-8">
          What’s the highest level of education you have attained.
        </p>

        {/* Education Level */}
        <label className="block text-sm font-medium mb-3">
          Level of Education
        </label>

        <div className="flex flex-wrap gap-3 mb-8">
          {EDUCATION_LEVELS.map((item) => (
            <button
              key={item}
              onClick={() => setLevel(item)}
              className={`
                px-4 py-2 rounded-full text-sm transition
                ${
                  level === item
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>

        {/* University */}
        <label className="block text-sm font-medium mb-2">
          Select University <span className="italic text-gray-400">(if any)</span>
        </label>

        <div className="relative mb-8">
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none"
          >
            <option value="">Select</option>
            <option>Delhi University</option>
            <option>Mumbai University</option>
            <option>Pune University</option>
            <option>Other</option>
          </select>

          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Certificate Upload */}
        <label className="block text-sm font-medium mb-2">
          Attach Certificate <span className="italic text-gray-400">(if any)</span>
        </label>

        <label className="border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer mb-8">
          <span className="text-sm text-gray-500">
            {file ? file.name : "Add file (.jpg, .png, .pdf)"}
          </span>
          <Upload size={18} className="text-gray-500" />
          <input
            type="file"
            accept=".jpg,.png,.pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {/* Display on Profile */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`
              w-12 h-7 rounded-full flex items-center px-1 transition
              ${showProfile ? "bg-black justify-end" : "bg-gray-300"}
            `}
          >
            <span className="w-5 h-5 bg-white rounded-full" />
          </button>

          <span className="text-sm font-medium">Display on Profile</span>
        </div>

        {/* Next Button */}
        <button
          disabled={!isValid}
          onClick={() => navigate("/achievements")}
          className={`
            w-full py-3 rounded-xl font-medium transition mt-auto
            ${
              isValid
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Education;
