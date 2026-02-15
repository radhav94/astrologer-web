import ConsultationHistory from "../../components/ConsultationHistory";
import Dashboard from "../../components/Dashboard";
import Profile from "../../screens/private/Profile/Profile";
import RecentActivity from "../../components/RecentActivity";
import Onboarding from "../../screens/public/Onboarding/Onboarding";
import Login from "../../screens/public/Login/Login";
import ChatInterface from "../../screens/private/Home/currentStatus/ChatInterface";
import Kundli from "../../screens/private/Home/currentStatus/kundli/kundli";
import SetPrice from "../../screens/private/Home/setPrice/SetPrice";
import SessionDetails from "../../screens/private/Home/upcomingSessions/SessionDetails";
import SchedulePage from "../../screens/private/Profile/availability/SchedulePage";
import AchievementsProfile from "../../screens/private/Profile/profileForms/AchievementsProfile";
import Languages from "../../screens/private/Profile/profileForms/Languages";
import ProfessionalProfileDtls from "../../screens/private/Profile/profileForms/ProfessionalDetails";
import CustomerSupport from "../../screens/private/Profile/support/customerSupport/CustomerSupport";
import FAQs from "../../screens/private/Profile/support/FAQs/FAQs";
import Guidelines from "../../screens/private/Profile/support/guidelines/Guidelines";
import TermsConditions from "../../screens/private/Profile/support/guidelines/TermsConditions/TermsCondition";
import RecentTickets from "../../screens/private/Profile/support/tickets/RecentTickets";
import WithdrawMoney from "../../screens/private/Profile/withdraw/WithdrawMoney";
import Basic from "../../screens/private/Profile/profileForms/Basic";
import InteractiveLiveStreaming from "../../components/livestream/InteractiveLiveStreaming";
import ChatWindow from "../../screens/private/chat/ChatWindow";
import ChatPage from "../../screens/private/chat/ChatPage";
import AgoraVoiceCalling from "../../screens/private/call/VoiceCall";

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
    VOICE_CALL: {
      path: "/voice-call",
      element: AgoraVoiceCalling,
    },
    RECENT_ACTIVITY: {
      path: "/recent-activity",
      element: RecentActivity,
    },
    PROFILE: {
      path: "/profile",
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
    EDUCATIONAL_DETAILS: {
      path: "/profile/educational-details",
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
    CHAT: {
      path: "/chats",
      element: ChatPage,
    },
    CHAT_WINDOW: {
      path: "/chat/:chatId",
      element: ChatWindow,
    },
    ASTRO_LIVE_STREAMING: {
      path: "/astrologer-dashboard/live-streaming",
      element: InteractiveLiveStreaming,
      header: false,
      footer: false,
    },
    KUNDLI_BY_ID: {
      path: "/kundli/:kundliId",
      element: Kundli,
      header: false,
      footer: false,
    },
  },
};
