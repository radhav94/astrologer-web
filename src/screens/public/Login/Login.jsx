import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Login.module.scss";
import * as AuthServices from "../../../services/appServices/authservice";
import { AppImages } from "../../../utils/appImages";
import Modal from "../../../components/UI/modal/Modal";
import BackButton from "../../../components/UI/backButton/BackButton";

const Login = () => {
  const navigate = useNavigate();
  const [isOpen,setIsOpen] = useState(true)
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
        phoneNumber: "91" + mobile, // 10-digit number
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
    <div className={styles.loginContainer}>
      <img
        src={AppImages.CosmicCircle}
        alt="Onboarding"
        className={styles.backgroundImage}
      />
      <img src={AppImages.MobileViewAccount} className={styles.mobileAccount} />
      
      <BackButton onClick={() => navigate(-1)} />

      <Modal modalOpen={isOpen} 
        setModalOpen={setIsOpen}
        doNotClose={true} 
        className={styles.onboardingModal}>
        
        <div className={styles.modalContent}>
          <h1 className={styles.heading}>
            Start your journey
          </h1>
          <p className={styles.description}>
            Enter your mobile number to register or log in securely.
          </p>

          {/* Phone Input */}
          <div className={styles.phoneInputWrapper}>
            <button className={styles.countrySelector}>
              <img
                src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                alt="India"
                className={styles.flagImage}
              />
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={styles.chevronIcon}>
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.inputWrapper}>
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="Enter your Number"
                onKeyDown={handleKeyDown}
                className={styles.phoneInput}
              />
              <span className={styles.countryCode}>
                +91
              </span>
            </div>
          </div>

          {/* Error */}
          {error && <p className={styles.errorText}>{error}</p>}

          {/* Get OTP Button */}
          <button
            onClick={handleGetOtp}
            disabled={!isValidMobile || loading}
            className={`${styles.otpButton} ${isValidMobile ? styles.active : styles.disabled}`}
          >
            {loading ? "Sending OTP..." : (
              <>
                Get OTP
                <ChevronRight size={18} />
              </>
            )}
          </button>

          {/* OR Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine} />
          </div>

          {/* Social Login */}
          <div className={styles.socialButtonsWrapper}>
            <button className={styles.socialButton}>
              Sign in with Google
            </button>
            <button className={styles.socialButton}>
              Sign in with Apple
            </button>
          </div>

          <p className={styles.footerText}>
            Your number will be used for secure login and communication only.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
