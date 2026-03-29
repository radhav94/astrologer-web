import { Icons } from "../../../components/Icons.jsx";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileTab from "./profileTab/ProfileTab.jsx";
import SwitchTabs from "../../../components/UI/tabs/SwitchTabs.jsx";
import Transactions from "./transactions/Transactions.jsx";
import SetAvailability from "./availability/SetAvailability.jsx";
import Support from "./support/Support.jsx";
import WithdrawalsList from "./withdraw/WithdrawalsList.jsx";
import { AppIcons, AppImages } from "../../../utils/appImages.js";
import styles from "./Profile.module.scss";
import { selectBasicInfo, selectProfileTabData } from "../../../utils/astrologerSelectors.js";
// Old: import from standalone wallet API
// import { useGetAllWalletsQuery } from "../../../redux/wallet/walletApi.js";
// New: import from centralized astrologerApi
import { useGetAllWalletsQuery } from "../../../redux/astrologer/astrologerApi.js";

const Profile = ({ onBack }) => {
  const location = useLocation();
  
  // Get astrologer details from Redux state
  const astrologerDetails = useSelector((state) => state.register.astrologerDetails);
  
  // Use Redux state as primary source
  const astrologerData = astrologerDetails ? { data: astrologerDetails, success: true } : null;
 
  // Get default tab from location state if provided
  const defaultTab = location.state?.data;

  // Transform API data using selectors
  const basicInfo = selectBasicInfo(astrologerData);
  const profileTabData = selectProfileTabData(astrologerData);

  const userName = basicInfo?.name || "Unknown";
  const experience = basicInfo?.experience || 0;

  // Old: wallet from astrologer details
  // const wallet = basicInfo?.wallet || 0;

  // New: wallet from dedicated wallet API — refetch on navigation back
  const { data: walletResponse } = useGetAllWalletsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const wallet = walletResponse?.data || 0;


  const tabs = [
    {
      label: "Profile",
      value: "profile",
      component: () => <ProfileTab profileData={profileTabData} />,
    },
    // {
    //   label: "Transactions",
    //   value: "transactions",
    //   component: Transactions,
    // },
    {
      label: "Availability",
      value: "availability",
      component: SetAvailability,
    },
    {
      label: "Withdrawals",
      value: "withdrawals",
      component: WithdrawalsList,
    },
    {
      label: "Support",
      value: "support",
      component: Support,
    },
  ];
  return (
    <div className={styles.profileContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <Link to="/dashboard" className={styles.backButton} onClick={onBack}>
          <Icons.ChevronLeft size={20} className={styles.backIcon} />
        </Link>
        <div className={styles.userInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.userName}>{userName}</h1>
            <img
              src={AppIcons.Verified}
              alt="verified"
              className={styles.verifiedBadge}
            />
          </div>
          {experience && (
            <p className={styles.userExperience}>Exp. {experience} Years</p>
          )}
        </div>
      </div>

      {/* Balance Card */}
      <div className={styles.balanceCard}>
        {/* Decorative background pattern */}
        <div className={styles.balanceCardBg}>
          <img src={AppImages.ProfileWallet} alt="Profile wallet" />
        </div>

        <div className={styles.balanceContent}>
          <div className={styles.balanceLabel}>
            <div className={styles.coinIcon}>
              <img src={AppIcons.Coin} alt="coin" />
              <img
                src={AppIcons.TwinkleStar}
                alt="TwinkleStar"
                className={styles.twinkleIcon}
              />
            </div>
            <span>Balance</span>
          </div>
          <h2 className={styles.balanceAmount}>
            ₹{wallet?.toLocaleString("en-IN")}
          </h2>
        </div>

        
          <Link
            to="/withdraw-money"
            className={styles.withdrawButton}
            style={{ cursor: wallet !== 0 ? "pointer" : "not-allowed" }}
          >
            Withdraw Money <Icons.ArrowRight size={16} />
          </Link>
        
      </div>

      

      <hr className={styles.divider} />

      {/* Tabs */}
      <SwitchTabs tabs={tabs} defaultTab={defaultTab} />
    </div>
  );
};

export default Profile;
