import { Link, useSearchParams } from "react-router-dom";
import { Icons } from "../../../../../components/Icons";
import SectionHeader from "../../../../../components/UI/sectionHeader/SectionHeader";
import styles from "./Guidelines.module.scss";

const Guidelines = () => {
  const [searchParams] = useSearchParams();
  const isWebView = searchParams.get("type") === "webview";

  const items = [
    {
      label: "Terms & Conditions",
      desc: "Read our service terms and platform policies.",
      icon: Icons.FileText,
      path: `/guidelines/terms-conditions${isWebView ? "?type=webview" : ""}`,
    },
    {
      label: "Privacy Policies",
      desc: "Read our service terms and platform policies.",
      icon: Icons.Shield,
    },
    {
      label: "App License",
      desc: "Read our service terms and platform policies.",
      icon: Icons.AlertCircle,
    },
  ];

  return (
    <div className={styles.container}>
      <SectionHeader title="Privacy and Security" />

      <div className={styles.itemsList}>
        {items.map((item, idx) => (
          <Link
            to={item.path}
            key={idx}
            className={styles.itemLink}
          >
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <h4 className={styles.itemLabel}>{item.label}</h4>
              </div>
              <p className={styles.itemDesc}>{item.desc}</p>
            </div>
            <div className={styles.itemIcon}>
              <Icons.ArrowRight size={18} />
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.deleteSection}>
        <button className={styles.deleteButton}>
          <span className={styles.deleteText}>
            Delete Account
          </span>
          <div className={styles.deleteIcon}>
            <Icons.ArrowRight size={18} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Guidelines;
