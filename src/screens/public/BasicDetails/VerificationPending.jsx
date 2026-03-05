import { useNavigate } from "react-router-dom";
import Button from "../../../components/UI/button/Button";
import styles from "./BasicForms.module.scss";
import { appSvgs } from "../../../utils/appImages";

const VerificationPending = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("shubhtalk_role");
    localStorage.removeItem("shubhtalk_astro_id");
    localStorage.removeItem("shubhtalk_astro_token");
    localStorage.removeItem("shubhtalk_astrologer_details");
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("otpSession");
    navigate("/");
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationWrapper}>
        {/* Status bar spacer */}
        <div className={styles.statusSpacer} />

        {/* Center Content */}
        <div className={styles.verificationContent}>

          {/* Illustration */}
          <div className={styles.verificationIllustration}>
            <img src={appSvgs.RegisterSuccess} alt="icon" />
          </div>

          {/* Heading */}
          <h1 className={styles.verificationHeading}>
            We're Verifying<br />Your Details
          </h1>

          {/* Description */}
          <p className={styles.verificationDescription}>
            Our team is reviewing your information to ensure
            everything aligns perfectly.
            <br />
            You'll be notified once your profile is approved.
          </p>
        </div>

        {/* Bottom Buttons - Fixed at bottom */}
        <div className={styles.verificationButtonsWrapper}>
          <div className={styles.verificationButtons}>
            <Button
              onClick={handleLogout}
              variant="outline"
              fullWidth={false}
              className={styles.verificationButtonOutline}
            >
              Explore Our Tutorial
            </Button>

            <Button
              onClick={handleLogout}
              variant="primary"
              fullWidth={false}
              className={styles.verificationButtonPrimary}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
