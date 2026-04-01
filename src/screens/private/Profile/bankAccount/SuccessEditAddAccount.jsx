import { useNavigate } from "react-router-dom";
import Button from "../../../../components/UI/button/Button";
import { AppImages } from "../../../../utils/appImages";
import styles from "./SuccessEditAddAccount.module.scss";

const SuccessEditAddAccount = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
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
        <Button
          variant="primary"
          onClick={() => navigate("/withdraw-money", { replace: true })}
        >
          Go to Withdraw Money
        </Button>
      </div>
    </div>
  );
};

export default SuccessEditAddAccount;
