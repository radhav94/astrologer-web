import ConsultationHistory from "../../components/ConsultationHistory";
import Dashboard, { UPCOMING_SESSIONS } from "../../components/Dashboard";
import Profile from "../../components/Profile";
import RecentActivity from "../../components/RecentActivity";
import HomeLayout from "../../layouts/HomeLayout";
import SessionDetails from "../../screens/private/Home/upcomingSessions/SessionDetails";

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
  },
};
