import { useState } from "react";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BasicDetails = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Female");
  const [dob, setDob] = useState("2002-01-01");
  const [email, setEmail] = useState("");


  const isValid = name.trim() !== "" && gender && dob;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-10">

        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-1">Let’s Begin</h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter Your Basic details
        </p>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-left">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter here"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Gender */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-left">
            Your Identity
          </label>

          <div className="grid grid-cols-3 gap-4">
            {["Male", "Female", "Others"].map((item) => (
              <button
                key={item}
                onClick={() => setGender(item)}
                className={`
                  py-4 rounded-xl text-sm font-medium transition
                  ${
                    gender === item
                      ? "bg-gray-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* DOB */}
        <div className="mb-10">
          <label className="block text-sm font-medium mb-2 text-left">
            Birth Date
          </label>

          <div className="relative">
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Calendar
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-left">
           Email Address
          </label>
          <input
            type="text"
            placeholder="Enter here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        {/* Next Button */}
        <button
         onClick={() => navigate("/professional-details")}
          disabled={!isValid}
          className={`
            w-full py-3 rounded-xl text-sm font-medium transition
            ${
              isValid
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BasicDetails;
