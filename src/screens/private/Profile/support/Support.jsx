import { Link } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import styles from "./Support.module.scss";

const Support = () => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Astrologer Support */}
        <Link to="/customer-support">
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Icons.Headphones size={32} />
            </div>
            <h3 className={styles.cardTitle}>
              Astrologer Support
            </h3>
            <p className={styles.cardDescription}>
              Chat with our team for quick help regarding your account or
              bookings.
            </p>
            <div className={styles.arrow}>
              <Icons.ArrowRight size={24} />
            </div>
          </div>
        </Link>

        {/* FAQs */}
        <Link to="/FAQs">
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Icons.HelpCircle size={32} />
            </div>
            <h3 className={styles.cardTitle}>FAQs</h3>
            <p className={styles.cardDescription}>
              Find quick answers to common app questions, payments, and
              features.
            </p>
            <div className={styles.arrow}>
              <Icons.ArrowRight size={24} />
            </div>
          </div>
        </Link>

        {/* Recent Tickets */}
        <Link to="/recent-tickets">
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Icons.FileText size={32} />
            </div>
            <h3 className={styles.cardTitle}>
              Recent Tickets
            </h3>
            <p className={styles.cardDescription}>
              Track updates on your latest support requests and resolutions.
            </p>
            <div className={styles.arrow}>
              <Icons.ArrowRight size={24} />
            </div>
          </div>
        </Link>

        {/* Guidelines */}
        <Link to="/guidelines">
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Icons.Shield size={32} />
            </div>
            <h3 className={styles.cardTitle}>
              Guidelines & Best Practices
            </h3>
            <p className={styles.cardDescription}>
              Access consultation standards, behavious policies,and tips.
            </p>
            <div className={styles.arrow}>
              <Icons.ArrowRight size={24} />
            </div>
          </div>
        </Link>
      </div>

      {/* Others Section */}
      <div className={styles.othersSection}>
        <h2>Others</h2>
        <div className={styles.othersGrid}>
          <div className={styles.smallCard}>
            <div className={styles.smallCardContent}>
              <h4>Community Guidelines</h4>
              <p>
                Learn how to use the platform safely and respectfully.
              </p>
            </div>
            <div className={styles.smallCardIcon}>
              <Icons.ArrowRight size={18} />
            </div>
          </div>

          <div className={styles.smallCard}>
            <div className={styles.smallCardContent}>
              <h4>Tips and Growth</h4>
              <p>
                Learn how to use the platform and earn more.
              </p>
            </div>
            <div className={styles.smallCardIcon}>
              <Icons.ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
