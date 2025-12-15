import { useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Achievements = () => {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [showProfile, setShowProfile] = useState(true);

  const isValid = description.trim().length > 0 || file;

  return (
    <div className="min-h-screen bg-white flex justify-center text-left">
      <div className="w-full max-w-md px-6 pt-10 pb-10 flex flex-col">

        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button onClick={() => navigate("/areaofexpertise")} className="text-sm text-gray-600 underline">
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-gray-500 text-sm mb-8">
          Show your milestones, recognitions and contributions.
          <br />
          This helps clients know your depth and experience.
        </p>

        {/* Textarea */}
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about your Achievements..."
          className="
            w-full border rounded-xl px-4 py-3 text-sm mb-6
            resize-none focus:outline-none focus:ring-1 focus:ring-black
          "
        />

        {/* File Upload */}
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

        {/* Display on Profile Toggle */}
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

          <span className="text-sm font-medium">
            Display on Profile
          </span>
        </div>

        {/* Next Button */}
        <button
          disabled={!isValid}
          onClick={() => navigate("/areaofexpertise")}
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

export default Achievements;
