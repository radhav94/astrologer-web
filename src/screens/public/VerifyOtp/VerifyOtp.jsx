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

  const mobile = state?.mobile || "+91 XXXXX XXXXX";
  const phoneNumber = state?.phoneNumber;
  const type = "ASTROLOGER";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(20);

  const inputsRef = useRef([]);

  /* ⏱ Timer */
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* 🔙 BLOCK BACK BUTTON */
  useEffect(() => {
    const handleBack = () => {
      navigate("/login", { replace: true });
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [navigate]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  /* ✅ VERIFY OTP */
  const handleVerifyOtp = async () => {
    if (!isOtpComplete || loading) return;

    try {
      setLoading(true);
      setError("");

      const otpNumber = Number(otp.join(""));
      if (isNaN(otpNumber)) throw new Error("OTP must be numeric");

      const payload = { phoneNumber, type, otp: otpNumber };
      const response = await AuthServices.verifyOtp(payload);

      if (response?.data?.statusCode !== 200 || !response?.data?.success) {
        throw new Error(response?.data?.message || "OTP verification failed");
      }

      Toast.success("OTP verified successfully");

      const userData = response?.data?.data || {};
      const { isRegister, accessToken, _id } = userData;

      saveUserToStorage(userData);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("shubhtalk_role", "ASTROLOGER");
      localStorage.setItem("shubhtalk_astro_id", _id);
      localStorage.setItem("shubhtalk_astro_token", accessToken);

      sessionStorage.removeItem("otpSession");

      const isNewUser = isRegister === false ? false : true;

      if (isNewUser) {
        sessionStorage.removeItem("onboardingSession");
        navigate("/dashboard", { replace: true });
      } else {
        sessionStorage.setItem("onboardingSession", "true");
        navigate("/basic-details", { replace: true });
      }
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

      const payload = { phoneNumber, type };
      await AuthServices.loginWithPhone(payload);
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md px-6 pt-16 pb-10">
        {/* Back Button */}
        <div className="flex items-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Enter OTP</h1>
        <p className="text-gray-500 text-sm mb-10">
          We've sent a 6-digit code to your mobile
          <br />
          <span className="font-medium text-black">{mobile}</span>
        </p>

        {/* OTP INPUTS */}
        <div className="flex justify-between gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 text-center text-xl border rounded-xl"
            />
          ))}
        </div>

        {/* RESEND */}
        <div className="flex justify-end text-sm mb-6">
          {timer > 0 ? (
            <span>Resend in {timer}s</span>
          ) : (
            <button onClick={handleResend} className="underline">
              Resend OTP
            </button>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleVerifyOtp}
          disabled={!isOtpComplete || loading}
          className="w-full py-3 rounded-xl bg-black text-white"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
