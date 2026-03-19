import { useNavigate } from "react-router-dom";
import { Icons } from "../../Icons";
import styles from "./SectionHeader.module.scss";

const SectionHeader = ({ title }) => {
  const navigate = useNavigate()
  return(
  <div className={styles.container}>
    <button
      onClick={() => navigate(-1)}
      className={styles.backButton}
    >
      <Icons.ChevronLeft size={20} width={30} height={30} className={styles.icon} />
    </button>

    <h1 className={styles.title}>{title}</h1>
  </div>
)};

export default SectionHeader;