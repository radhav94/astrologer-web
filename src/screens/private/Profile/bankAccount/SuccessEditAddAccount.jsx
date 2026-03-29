import { useNavigate } from "react-router-dom";
import styles from "./SuccessEditAddAccount.module.scss";
import { AppImages } from "../../../../utils/appImages";

const SuccessEditAddAccount = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Green badge checkmark */}
        <div className={styles.badgeWrapper}>
          <img
            src={AppImages.SuccessCheck}
            alt="Success"
            className={styles.badgeImg}
          />
        </div>

        <h1 className={styles.title}>Bank details added</h1>
        <p className={styles.description}>
          Your bank account is <span className={styles.bold}>under review</span>.
          {"\n"}You'll be able to withdraw funds once it's approved.
        </p>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.ctaButton}
          onClick={() => navigate("/withdraw-money", { replace: true })}
        >
          Go to Withdraw Money
        </button>
      </div>
    </div>
  );
};

export default SuccessEditAddAccount;
