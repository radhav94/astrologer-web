import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Icons } from "./Icons";
import { useCall } from "../context/CallContext";
import { Toast } from "../components";
import styles from "./Sidebar.module.scss";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { kundliId } = useParams();
  const { setAstroId } = useCall(); // 🔥 VERY IMPORTANT

  // Check verification status from Redux state
  const astrologerDetails = useSelector((state) => state.register?.astrologerDetails);
  const isRegister = astrologerDetails?.isRegister ?? false;
  const isVerified = astrologerDetails?.isVerified ?? false;

  // Only check manualVerification if both isRegister and isVerified are true
  const isManualVerification = (isRegister && isVerified)
    ? (astrologerDetails?.manualVerification ?? false)
    : false;

  // IDs of menu items restricted for non-verified astrologers
  const restrictedItemIds = ["history", "chats", "live"];

  const handleLogout = () => {
    // localStorage.removeItem("shubhtalk_role");
    // localStorage.removeItem("shubhtalk_astro_id");
    // localStorage.removeItem("shubhtalk_astro_token");
    // localStorage.removeItem("shubhtalk_astrologer_details");
    // localStorage.removeItem("accessToken");
    localStorage.clear();
    sessionStorage.removeItem("otpSession");
    // navigate("/");
    Toast.success("You have been logged out successfully.");

    setAstroId(null);

    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      icon: Icons.Home,
      label: "Dashboard",
      id: "dashboard",
      path: "/dashboard",
    },
    {
      icon: Icons.Calendar,
      label: "Order History",
      id: "history",
      path: "/consultation-history",
    },
    {
      icon: Icons.Chats,
      label: "Chats",
      id: "chats",
      path: "/chats",
    },
    // {
    //   icon: Icons.Wallet,
    //   label: "Recent Activity",
    //   id: "activity",
    //   path: "/recent-activity",
    // },
    { icon: Icons.User, label: "Profile", id: "profile", path: "/profile" },
    {
      icon: Icons.Radio,
      label: "Live",
      id: "live",
      path: "/live-preview",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : styles.closed}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${isOpen ? styles.open : ""} ${kundliId ? styles.hidden : ""}`}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <span className={styles.logoText}>S</span>
            </div>
            <span className={styles.brandName}>ShubhAstro</span>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <Icons.X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className={styles.nav}>
          {/* Filter out restricted items: only show if isRegister, isVerified, and manualVerification are all true */}
          {menuItems
            .filter((item) => isManualVerification || !restrictedItemIds.includes(item.id))
            .map((item) => (
            <Link
              key={item.id}
              onClick={onClose}
              to={item.path}
              className={`${styles.menuItem} ${
                location.pathname === item.path ? styles.active : ""
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <Icons.LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
