import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import * as AuthServices from "../../../services/appServices/authservice"

const Login = () => {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Allow numbers only & max 10 digits
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // remove non-numbers
    if (value.length <= 10) {
      setMobile(value);
      setError("");
    }
  };

  // ✅ Mobile validation (India)
  const isValidMobile = mobile.length === 10;

  // ✅ Get OTP API Call
  const handleGetOtp = async () => {
    if (!isValidMobile) return;
  
    try {
      setLoading(true);
      setError("");
  
      const type = "ASTROLOGER";
  
      const payload = {
        phoneNumber: '91'+mobile, // 10-digit number
        type,
      };
  
      const response = await AuthServices.loginWithPhone(payload);
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to send OTP");
      }
  
      // ✅ Navigate to OTP verify page
      sessionStorage.setItem("otpSession", "true");
      navigate("/verify-otp", {
        state: {
          mobile: `+91${mobile}`,
          phoneNumber: `91${mobile}`,
        },
      });
  
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isValidMobile && !loading) {
      handleGetOtp();
    }
  };
  

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-6 pb-10 flex flex-col">

        {/* Top Bar */}
        <div className="flex items-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">

          <h1 className="text-3xl font-bold text-black mb-2">
            Start your journey
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter your mobile number to register
            <br />
            or log in securely.
          </p>

          {/* Phone Input */}
          <div className="flex gap-3 mb-2">
            <button className="flex items-center gap-2 border rounded-xl px-3 py-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                alt="India"
                className="w-6 h-4 object-cover"
              />
              <span className="text-sm">+91</span>
              <span className="text-xs">⌄</span>
            </button>

            <input
              type="tel"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="Enter your Number"
              onKeyDown={handleKeyDown} 
              className="
                flex-1 border rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-1 focus:ring-black
              "
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs mb-4">{error}</p>
          )}

          {/* Get OTP Button */}
          <button
            onClick={handleGetOtp}
            disabled={!isValidMobile || loading}
            className={`
              w-full py-3 rounded-xl text-sm font-medium mb-8 transition
              ${
                isValidMobile
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {/* OR Divider */}
          {/* <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div> */}

          {/* Social Login */}
          {/* <div className="space-y-4">
            <button className="w-full border rounded-xl py-3 text-sm font-medium">
              Sign in with Google
            </button>
            <button className="w-full border rounded-xl py-3 text-sm font-medium">
              Sign in with Apple
            </button>
          </div> */}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Your number will be used for secure login and communication only.
        </p>
      </div>
    </div>
  );
};

export default Login;
