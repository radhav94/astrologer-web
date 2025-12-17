import { useState } from "react";
import { Button, SectionHeader, Chip } from "./ui";
import { useNavigate } from "react-router-dom";

const Basic = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("Hari Prasad");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("2002-01-01");
  const [phone, setPhone] = useState("+91 98989 98989");
  const [email, setEmail] = useState("hariprasad@gmail.com");

  const genderOptions = ["Male", "Female", "Other"];

  return (
    <div className="flex flex-col h-full text-left">
      <SectionHeader title="Basic Details" />

      <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="Enter your full name"
          />
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-3">
            Gender
          </label>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={gender === option}
                onClick={() => setGender(option)}
              />
            ))}
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            onClick={(e) => e.target.showPicker?.()}
            className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="+91 00000 00000"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Email ID
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="example@gmail.com"
          />
        </div>
      </div>

      <div className=" w-full mt-8 pt-6 border-t border-gray-100">
        <Button onClick={() => navigate("/profile")}>Save</Button>
      </div>
    </div>
  );
};

export default Basic;
