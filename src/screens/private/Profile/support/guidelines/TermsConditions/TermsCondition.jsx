import { Link } from "react-router-dom";
import { Icons } from "../../../../../../components/Icons";
import styles from "./TermsCondition.module.scss";
import SectionHeader from "../../../../../../components/UI/sectionHeader/SectionHeader";

const TermsConditions = () => {
  return (
    <div className={styles.container}>
       <SectionHeader title="Terms & Conditions" />
      

      <div className={styles.content}>
        <div className={styles.section}>
          <p className={styles.paragraph}>
            Welcome to ShubhAstro. These Terms & Conditions ("Terms") govern
            your use of our mobile application, website, products, and services
            ("Platform"). By accessing or using the Platform, you agree to be
            bound by these Terms.
          </p>
          <p className={styles.boldText}>
            If you do not agree, please do not use the Platform.
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            1. Eligibility
          </h3>
          <p>
            You must be 18 years or older to create an account and use
            ShubhAstro. By registering, you confirm that the information you
            provide is accurate and true.
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            2. Nature of Services
          </h3>
          <p className={styles.paragraph}>ShubhAstro provides:</p>
          <ul className={styles.list}>
            <li>Access to astrologers for consultations</li>
            <li>Birth chart/Kundli generation</li>
            <li>Tarot, numerology, and related esoteric services</li>
            <li>Content, reports, and predictions</li>
          </ul>
          <p className={styles.highlightBox}>
            All predictions are advisory in nature. They are not guaranteed
            outcomes and should not replace professional advice such as medical,
            legal, or financial counsel.
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            3. User Account
          </h3>
          <p className={styles.paragraph}>
            To use ShubhAstro, you may need to register using your mobile number
            and OTP verification. You are responsible for:
          </p>
          <ul className={styles.list}>
            <li>Maintaining confidentiality of your account</li>
            <li>All activity under your account</li>
            <li>Updating your information whenever necessary</li>
          </ul>
          <p>
            ShubhAstro reserves the right to suspend or terminate accounts that
            violate these Terms.
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            4. Consultations & Interactions
          </h3>
          <p className={styles.paragraph}>When you book a consultation on ShubhAstro:</p>
          <ul className={styles.list}>
            <li>
              The astrologer is responsible for the quality of insights offered.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
