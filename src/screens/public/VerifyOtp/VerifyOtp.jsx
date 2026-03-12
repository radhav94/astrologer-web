import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as AuthServices from "../../../services/appServices/authservice";
import { saveUserToStorage } from "../../../utils/authStorage";
import { Toast } from "../../../components";
import { useCall } from "../../../context/CallContext";
import { setAstrologerId, updateRegisterData } from "../../../reducer/registerSlice";
import { useDispatch } from "react-redux";
import BackButton from "../../../components/UI/backButton/BackButton";
import Button from "../../../components/UI/button/Button";
import styles from "./VerifyOtp.module.scss";

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const mobile = state?.mobile || "+91 XXXXX XXXXX";
  const phoneNumber = state?.phoneNumber;
  const type = "ASTROLOGER";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(20);
  const { setAstroId } = useCall();

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
    if (e.key === "Enter" && index == otp.length - 1) handleVerifyOtp();
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

      const payload = { phoneNumber, type, otp: String(otpNumber) };
      const response = await AuthServices.verifyOtp(payload);

      console.log("Response Data:", response);

      if (response?.data?.statusCode !== 200 || !response?.data?.success) {
        throw new Error(response?.data?.message || "OTP verification failed");
      }

      Toast.success("OTP verified successfully");

      const userData = response?.data?.data || {};
      const { isRegister, accessToken, _id } = userData;
      dispatch(
        updateRegisterData({
          role: userData?.role,
          phoneNumber: userData?.phoneNumber,
        }),
      );
      dispatch(
        setAstrologerId(userData?._id)
      )

      saveUserToStorage(userData);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("shubhtalk_role", "ASTROLOGER");
      localStorage.setItem("shubhtalk_astro_id", _id);
      setAstroId(_id);

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
    <div className={styles.verifyOtpContainer}>
      
      
      <div className={styles.verifyOtpCard}>
        <BackButton onClick={() => navigate(-1)} />
        <div className={styles.contentWrapper}>
          <div className={styles.content}>
            <h1 className={styles.heading}>Enter OTP</h1>
            <p className={styles.description}>
              We've sent a 4-digit code to your mobile {mobile}. Enter it below to continue.
            </p>

            {/* OTP INPUTS */}
            <div className={styles.otpInputsWrapper}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={styles.otpInput}
                />
              ))}
            </div>

            {/* RESEND */}
            <div className={styles.resendWrapper}>
              <button className={styles.didntGetText}>Didn't get it?</button>
              {timer > 0 ? (
                <span className={styles.resendTimer}>Resend in {timer} seconds</span>
              ) : (
                <button onClick={handleResend} className={styles.resendButton}>
                  Resend OTP
                </button>
              )}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            
          </div>
          <Button
            onClick={handleVerifyOtp}
            disabled={!isOtpComplete || loading}
            variant="primary"
            size="medium"
            icon={!loading && <ChevronRight size={18} />}
            iconPosition="right"
            className={styles.verifyButton}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
