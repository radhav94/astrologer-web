import { useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VerifyProfile = () => {
  const navigate = useNavigate();

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadhar, setAadhar] = useState(null);
  const [pan, setPan] = useState(null);

  const isValid = profilePhoto && aadhar && pan;

  const UploadBox = ({ label, file, setFile }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-left">
        {label}
      </label>

      <label className="border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer">
        <span className="text-sm text-gray-500 truncate">
          {file ? file.name : "Add file (.jpg, .png, .pdf)"}
        </span>

        <Upload size={18} className="text-gray-600" />

        <input
          type="file"
          accept=".jpg,.png,.pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex justify-center text-left">
      <div className="w-full max-w-md px-6 pt-10 pb-10 flex flex-col">

        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button 
          onClick={() => navigate("/verificationpending")}
          className="text-sm text-gray-600 underline">
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">
          Verify Your Profile
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Help us ensure authenticity. Verified astrologers
          gain more visibility and trust from clients.
        </p>

        {/* Upload Fields */}
        <UploadBox
          label="Profile Photo"
          file={profilePhoto}
          setFile={setProfilePhoto}
        />

        <UploadBox
          label="Aadhar Card"
          file={aadhar}
          setFile={setAadhar}
        />

        <UploadBox
          label="PAN Card"
          file={pan}
          setFile={setPan}
        />

        {/* Next Button */}
        <button
          disabled={!isValid}
          onClick={() => navigate("/verificationpending")}
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

export default VerifyProfile;
