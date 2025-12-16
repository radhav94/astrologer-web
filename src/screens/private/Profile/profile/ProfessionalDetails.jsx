import { useState } from "react";
import { Button, Toggle, SectionHeader, Chip } from "./ui";
import { Paperclip } from "lucide-react";

const ProfessionalProfileDtls = () => {
  const [educationLevel, setEducationLevel] = useState("Undergraduate");
  const [university, setUniversity] = useState("Banaras University");
  const [certificateFile, setCertificateFile] = useState("degree.pdf");
  const [displayOnProfile, setDisplayOnProfile] = useState(false);

  const levels = ["High School", "Undergraduate", "Postgraduate", "PhD"];

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Professional Details" />

      <div className="flex-1 ">
        {/* Level of Education */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-3">
            Level of Education
          </label>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Chip
                key={level}
                label={level}
                selected={educationLevel === level}
                onClick={() => setEducationLevel(level)}
              />
            ))}
          </div>
        </div>

        {/* University Name */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            University/College Name
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Certificate Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Certificate
          </label>
          <div className="relative">
            <input
              type="text" // simulating file input look with text for wireframe accuracy
              readOnly
              value={certificateFile}
              className="w-full p-4 rounded-xl border border-gray-400 text-gray-900 font-medium bg-white pr-12 cursor-pointer hover:bg-gray-50"
              onClick={() => document.getElementById("file-upload")?.click()}
            />
            <Paperclip
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              size={20}
            />
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0])
                  setCertificateFile(e.target.files[0].name);
              }}
            />
          </div>
        </div>

        {/* Toggle */}
        <div className="pt-4">
          <Toggle
            label="Display on Profile"
            checked={displayOnProfile}
            onChange={setDisplayOnProfile}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <Button onClick={() => console.log("Saving Professional Details...")}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalProfileDtls;
