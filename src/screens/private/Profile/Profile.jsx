import { Icons } from "../../../components/Icons.jsx";
import { Link, useLocation } from "react-router-dom";
import ProfileTab from "./profileTab/ProfileTab.jsx";
import SwitchTabs from "../../../components/UI/tabs/SwitchTabs.jsx";
import Transactions from "./transactions/Transactions.jsx";
import SetAvailability from "./availability/SetAvailability.jsx";
import Support from "./support/Support.jsx";
import { AppIcons, AppImages } from "../../../utils/appImages.js";
import styles from "./Profile.module.scss";
import { useGetAstrologerByIdQuery } from "../../../redux/astrologer/astrologerApi.js";
import { selectBasicInfo, selectProfileTabData } from "../../../utils/astrologerSelectors.js";

const Profile = ({ onBack }) => {
  const location = useLocation();
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details"),
  );
  const astrologerId = userData?._id;
  const { data: astrologerData, refetch } = useGetAstrologerByIdQuery(astrologerId);
 
  // Get default tab from location state if provided
  const defaultTab = location.state?.data;

  // Transform API data using selectors
  const basicInfo = selectBasicInfo(astrologerData);
  const profileTabData = selectProfileTabData(astrologerData);

  const userName = basicInfo?.name || "Unknown";
  const experience = basicInfo?.experience || 0;
  const wallet = basicInfo?.wallet || 0;

  console.log("first",basicInfo,profileTabData)

  const tabs = [
    {
      label: "Profile",
      value: "profile",
      component: () => <ProfileTab profileData={profileTabData} refetch={refetch} />,
    },
    {
      label: "Transactions",
      value: "transactions",
      component: Transactions,
    },
    {
      label: "Availability",
      value: "availability",
      component: SetAvailability,
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
          <Icons.ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <div className={styles.userInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.userName}>{userName}</h1>
            <img src={AppIcons.Verified} alt="verified" className={styles.verifiedBadge} />
          </div>
          <p className={styles.userExperience}>Exp. {experience} Years</p>
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
          <h2 className={styles.balanceAmount}>₹{wallet}</h2>
        </div>

        <Link to="/withdraw-money" className={styles.withdrawButton}>
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
