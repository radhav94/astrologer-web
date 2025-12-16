import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as AuthServices from "../../../services/appServices/authservice";
import { saveUserToStorage } from "../../../utils/authStorage";
import { Toast } from "../../../components";

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 📱 Values from previous screen
  const mobile = state?.mobile || "+91 XXXXX XXXXX";
  const phoneNumber = state?.phoneNumber;
  const type = "ASTROLOGER";

  // 🔢 States
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(20);

  const inputsRef = useRef([]);

  /* ⏱ Resend Timer */
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* 🔢 Handle OTP Input */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ⬅ Backspace Handling */
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  /* ✅ VERIFY OTP */
  const handleVerifyOtp = async () => {
    if (!isOtpComplete || loading) return;
  
    try {
      setLoading(true);
      setError("");
  
      if (!otp || otp.length === 0) {
        throw new Error("OTP is empty");
      }
  
      const otpNumber = Number(otp.join(""));
      if (isNaN(otpNumber)) {
        throw new Error("OTP must be numeric");
      }
  
      const payload = {
        phoneNumber,
        type,
        otp: otpNumber,
      };
  
      const response = await AuthServices.verifyOtp(payload);

      if (response?.data?.statusCode !== 200 || !response?.data?.success) {
        throw new Error(response?.data?.message || "OTP verification failed");
      }
      Toast.success("OTP verified successfully");
      const userData = response?.data?.data || {};
      const { isRegister, accessToken, _id } = userData;
  
      // SAVE ONLY NECESSARY DATA
      saveUserToStorage(userData);
      localStorage.setItem("shubhtalk_role", "ASTROLOGER");
      localStorage.setItem("shubhtalk_astro_id", _id);
      localStorage.setItem("shubhtalk_astro_token", accessToken);
  
      // CUSTOMER → IF NEW, REGISTER
      const isNewUser = isRegister === true || String(isRegister) === "false";
      navigate(isNewUser ?  "/basic-details" : "/dashboard");
  
    } catch (err) {
      setError(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };
  

  /* 🔁 RESEND OTP */
  const handleResend = async () => {
    try {
      setTimer(20);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      setError("");

      const payload = {
        phoneNumber,
        type,
      };

      await AuthServices.loginWithPhone(payload);

    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-16 pb-10">

        {/* 🔙 Back */}
        <div className="flex items-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* 🔢 Heading */}
        <h1 className="text-3xl font-bold mb-2">Enter OTP</h1>
        <p className="text-gray-500 text-sm mb-10">
          We've sent a 6-digit code to your mobile
          <br />
          <span className="font-medium text-black">{mobile}</span>
        </p>

        {/* 🔢 OTP INPUTS */}
        <div className="flex justify-between gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="
                w-12 sm:w-14 h-14 sm:h-16
                text-center text-xl sm:text-2xl font-bold
                border rounded-xl
                focus:outline-none focus:ring-1 focus:ring-black
              "
            />
          ))}
        </div>

        {/* 🔁 RESEND */}
        <div className="flex justify-between text-sm mb-10">
          <span className="text-gray-500">Didn’t get it?</span>

          {timer > 0 ? (
            <span className="text-black font-medium">
              Resend in {timer} seconds
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-black font-semibold underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* ❌ Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* ✅ VERIFY BUTTON */}
        <button
          onClick={handleVerifyOtp}
          disabled={!isOtpComplete || loading}
          className={`
            w-full py-3 rounded-xl font-medium transition
            ${
              isOtpComplete
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
