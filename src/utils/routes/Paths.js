import ConsultationHistory from "../../components/ConsultationHistory";
import Dashboard, { UPCOMING_SESSIONS } from "../../components/Dashboard";
import Profile from "../../components/Profile";
import RecentActivity from "../../components/RecentActivity";
import HomeLayout from "../../layouts/HomeLayout";
import SetPrice from "../../screens/private/Home/setPrice/SetPrice";
import SessionDetails from "../../screens/private/Home/upcomingSessions/SessionDetails";
import CustomerSupport from "../../screens/private/Profile/support/customerSupport/CustomerSupport";
import FAQs from "../../screens/private/Profile/support/FAQs/FAQs";
import Guidelines from "../../screens/private/Profile/support/guidelines/Guidelines";
import TermsConditions from "../../screens/private/Profile/support/guidelines/TermsConditions/TermsCondition";
import RecentTickets from "../../screens/private/Profile/support/tickets/RecentTickets";
import WithdrawMoney from "../../screens/private/Profile/withdraw/WithdrawMoney";

export const PATH = {
  publicRoutes: {},
  privateRoutes: {
    HOME: {
      path: "/",
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
  },
};
