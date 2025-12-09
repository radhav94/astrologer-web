import { useLocation, useNavigate } from "react-router";
import styles from "./Navbar.module.scss";
import PrimaryText from "../../components/PrimaryText";

const NavbarItem = ({ title, path, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = path && location.pathname === path;

  return (
    <li
      className={`${children ? styles.dropdown : ""} ${
        isActive ? styles.active : ""
      }`}
      onClick={!children ? () => navigate(path) : undefined}
    >
      {/* FIXED ALIGNMENT WRAPPER */}
      <div className={styles.navItemLabel}>
        <PrimaryText size_14>{title}</PrimaryText>
        {children && <span className={styles.arrow}></span>}
      </div>

      {children && (
        <div className={styles.dropdownWrapper}>
          <ul className={styles.dropdownMenu}>
            {children.map((child, idx) => (
              <li
                key={idx}
                onClick={() =>
                  child?.onClick ? child?.onClick() : navigate(child.path)
                }
              >
                {child.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export default NavbarItem;
