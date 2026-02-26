import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Onboarding.module.scss";
import { AppImages, appSvgs } from "../../../utils/appImages";
import Modal from "../../../components/UI/modal/Modal";
import Button from "../../../components/UI/button/Button";
import { ArrowRight, ChevronRight, MoveRight } from "lucide-react";


const Onboarding = () => {
  const navigate = useNavigate();
  const [isOpen,setIsOpen] = useState(true)

  useEffect(() => {
    // Clear all localStorage
    localStorage.clear();

    // Clear all sessionStorage
    sessionStorage.clear();

    // Clear all cookies safely
    try {
      document.cookie
        .split(";")
        .forEach(
          (c) =>
            (document.cookie =
              c.trim().split("=")[0] +
              "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/")
        );
    } catch (err) {
      console.warn("Failed to clear cookies", err);
    }
  }, []);

  return (
    <div className={styles.onboardingContainer}>
      {/* Background Image */}
      <img
        src={AppImages.CosmicCircle}
        alt="Onboarding"
        className="absolute inset-0 w-full h-full object-cover sm:object-contain mx-auto"
      />

      <img src={AppImages.MobileViewAccount}  className={styles.mobileAccount} />

      {/* Bottom Sheet Modal */}
      <Modal 
        modalOpen={isOpen} 
        setModalOpen={setIsOpen}
        doNotClose={true}
        className={styles.onboardingModal}
      >
        <div className={styles.contentWrapper}>
          {/* Title */}
          <h1 className={styles.title}>
            Share Your Wisdom with the World
          </h1>

          {/* Description */}
          <p className={styles.description}>
            Join a community of trusted astrologers offering authentic
            consultations to seekers worldwide.
          </p>

          
          {/* CTA Button */}
          <Button
            onClick={() => navigate("/login")}
            className={styles.ctaButton}
          >
            Begin My Journey
            <span className={styles.arrow}><ChevronRight /></span>
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default Onboarding;
