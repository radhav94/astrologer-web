import { useNavigate } from "react-router";
import styles from "./Navbar.module.scss";

import NavbarItem from "./NavbarItem";

import { FiMenu } from "react-icons/fi";
import PrimaryText from "../../components/PrimaryText";

const Navbar = () => {
  const navigate = useNavigate();
  const MENU_LIST = [];

  const BOTTOM_MENU = [];

  return (
    <>
      {/* SIDEBAR */}
      {/* <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}
      <header className={`${styles.topBar}`}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div className={styles.logoContainer} onClick={() => navigate("/")}>
              <PrimaryText marginLeft="5px" isBold size_28>
                ShubhAstro
              </PrimaryText>
            </div>
          </div>

          <div className={styles.rightSection}>
            <button
              className={styles.menuIcon}
              onClick={() => setSidebarOpen(true)}
              aria-label="Hamburger Menu"
            >
              <FiMenu />
            </button>

            <header className={styles.navbar}>
              <nav className={styles.navbarMenu}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ul>
                    {MENU_LIST.map((item, index) => (
                      <NavbarItem key={index} {...item} />
                    ))}
                  </ul>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ul>
                    {BOTTOM_MENU.map((item, index) => (
                      <NavbarItem key={index} {...item} />
                    ))}
                  </ul>
                </div>
              </nav>
            </header>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
