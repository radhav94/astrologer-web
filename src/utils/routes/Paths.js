import ConsultationHistory from "../../screens/private/consultationHistory/ConsultationHistory";
import Dashboard from "../../screens/private/dashboard/Dashboard";
import Profile from "../../screens/private/Profile/Profile";
import RecentActivity from "../../screens/private/recentActivity/RecentActivity";
import Onboarding from "../../screens/public/Onboarding/Onboarding";
import Login from "../../screens/public/Login/Login";
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
import TicketDetail from "../../screens/private/Profile/support/tickets/TicketDetail";
import WithdrawMoney from "../../screens/private/Profile/withdraw/WithdrawMoney";
import Basic from "../../screens/private/Profile/profileForms/Basic";
import InteractiveLiveStreaming from "../../components/livestream/InteractiveLiveStreaming";
import LivePreview from "../../components/livestream/LivePreview";
import ChatWindow from "../../screens/private/chat/ChatWindow";
import ChatPage from "../../screens/private/chat/ChatPage";
import AgoraVoiceCalling from "../../screens/private/call/VoiceCall";
import EducationDetails from "../../screens/private/Profile/profileForms/EducationDetails";
import AddEditBankAccount from "../../screens/private/Profile/bankAccount/AddEditBankAccount";
import ConfirmWithdrawal from "../../screens/private/Profile/bankAccount/ConfirmWithdrawal";
import SuccessEditAddAccount from "../../screens/private/Profile/bankAccount/SuccessEditAddAccount";
import SuccessWithdrawal from "../../screens/private/Profile/bankAccount/SuccessWithdrawal";
import Specialties from "../../screens/private/Profile/profileForms/Specialties";

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
    CONSULTATION_HISTORY: {
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
    TICKET_DETAIL: {
      path: "/ticket/:ticketId",
      element: TicketDetail,
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
    SPECIALTIES_DETAILS: {
      path: "/profile/specialties-details",
      element: Specialties,
    },
    EDUCATIONAL_DETAILS: {
      path: "/profile/educational-details",
      element: EducationDetails,
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
    LIVE_PREVIEW: {
      path: "/live-preview",
      element: LivePreview,
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
   
    ADD_BANK_ACCOUNT: {
      path: "/bank-accounts/add",
      element: AddEditBankAccount,
    },
    EDIT_BANK_ACCOUNT: {
      path: "/bank-accounts/edit/:bankAccId",
      element: AddEditBankAccount,
    },
    CONFIRM_WITHDRAWAL: {
      path: "/confirm-withdrawal",
      element: ConfirmWithdrawal,
    },
    WITHDRAWAL_SUCCESS: {
      path: "/withdrawal-success",
      element: SuccessWithdrawal,
    },
    BANK_ACCOUNT_SUCCESS: {
      path: "/bank-account-success",
      element: SuccessEditAddAccount,
    },
  },
};
