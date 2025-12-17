import ConsultationHistory from "../../components/ConsultationHistory";
import Dashboard from "../../components/Dashboard";
import Profile from "../../components/Profile";
import RecentActivity from "../../components/RecentActivity";
import Onboarding from "../../screens/public/Onboarding/Onboarding";
import Login from "../../screens/public/Login/Login";
import VerifyOtp from "../../screens/public/VerifyOtp/VerifyOtp";
import BasicDetails from "../../screens/public/BasicDetails/BasicDetails";
import ProfessionalDetails from "../../screens/public/BasicDetails/ProfessionalDetails";
import LanguagesYouSpeak from "../../screens/public/BasicDetails/LanguagesYouSpeak";
import Education from "../../screens/public/BasicDetails/Education";
import Achievements from "../../screens/public/BasicDetails/Achievements";
import AreaOfExpertise from "../../screens/public/BasicDetails/AreaOfExpertise";
import VerifyProfile from "../../screens/public/BasicDetails/VerifyProfile";
import VerificationPending from "../../screens/public/BasicDetails/VerificationPending";
import HomeLayout from "../../layouts/HomeLayout";
import ChatInterface from "../../screens/private/Home/currentStatus/ChatInterface";
import Kundli from "../../screens/private/Home/currentStatus/kundli/kundli";
import SetPrice from "../../screens/private/Home/setPrice/SetPrice";
import SessionDetails from "../../screens/private/Home/upcomingSessions/SessionDetails";
import SchedulePage from "../../screens/private/Profile/availability/SchedulePage";
import AchievementsProfile from "../../screens/private/Profile/profile/AchievementsProfile";
import Languages from "../../screens/private/Profile/profile/Languages";
import ProfessionalProfileDtls from "../../screens/private/Profile/profile/ProfessionalDetails";
import CustomerSupport from "../../screens/private/Profile/support/customerSupport/CustomerSupport";
import FAQs from "../../screens/private/Profile/support/FAQs/FAQs";
import Guidelines from "../../screens/private/Profile/support/guidelines/Guidelines";
import TermsConditions from "../../screens/private/Profile/support/guidelines/TermsConditions/TermsCondition";
import RecentTickets from "../../screens/private/Profile/support/tickets/RecentTickets";
import WithdrawMoney from "../../screens/private/Profile/withdraw/WithdrawMoney";
import Basic from "../../screens/private/Profile/profile/Basic";

export const PATH = {
  publicRoutes: {
    HOME: {
      path: "/",
      element: Onboarding,
    },
    Login: {
      path: "/login",
      element: Login,
    },
  },
  privateRoutes: {
    DASHBOARD: {
      path: "/dashboard",
      element: Dashboard,
    },
    CONSULTATION_HOSTORY: {
      path: "/consultation-history",
      element: ConsultationHistory,
    },
    RECENT_ACTIVITY: {
      path: "/recent-activity",
      element: RecentActivity,
    },
    PROFILE: {
      path: "/Profile",
      element: Profile,
    },
    UPCOMING_SESSIONS_DETAILS: {
      path: "/upcoming-sessions",
      element: SessionDetails,
    },
    SET_CONSULTATION_PRICE: {
      path: "/set-your-consultation-price",
      element: SetPrice,
    },
    CALL_STATUS: {
      path: "/call-status",
      element: ChatInterface,
    },
    WITHDRAW_MONEY: {
      path: "/withdraw-money",
      element: WithdrawMoney,
    },
    CUSTOMER_SUPPORT: {
      path: "/customer-support",
      element: CustomerSupport,
    },
    FAQS: {
      path: "/FAQs",
      element: FAQs,
    },
    RECENT_TICKETS: {
      path: "/recent-tickets",
      element: RecentTickets,
    },
    GUIDELINES: {
      path: "/guidelines",
      element: Guidelines,
    },
    TERMS_CONDITIONS: {
      path: "/guidelines/terms-conditions",
      element: TermsConditions,
    },
    SCHEDULE_AVAILABILITY: {
      path: "/schedule-availablity",
      element: SchedulePage,
    },
    BASIC_EDIT_DETAILS: {
      path: "/profile/basic-details",
      element: Basic,
    },
    LANGUAGES: {
      path: "/profile/languages",
      element: Languages,
    },
    PROFESSIONALS_DETAILS: {
      path: "/profile/professional-details",
      element: ProfessionalProfileDtls,
    },
    ACHIEVEMENTS_PROFILE: {
      path: "/profile/achievements",
      element: AchievementsProfile,
    },
    CLIENT_DETAILS: {
      path: "/client-details",
      element: Kundli,
    },
  },
};
