// utils/routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// Routes restricted to verified users only (manualVerification === true)
const VERIFIED_ONLY_ROUTES = [
  "/consultation-history",
  "/chats",
  "/chat",           // matches /chat/:chatId
  "/live-preview",
  "/astrologer-dashboard/live-streaming",
];

const PrivateRoute = () => {
  const isLoggedIn = !!localStorage.getItem("shubhtalk_astro_token");
  const onboardingSession = sessionStorage.getItem("onboardingSession");
  const location = useLocation();

  // Get manualVerification from Redux
  const manualVerification = useSelector(
    (state) => state.register?.astrologerDetails?.manualVerification,
  );

  // 🔒 NOT LOGGED IN → LOGIN
  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // 🔒 LOGGED IN BUT ONBOARDING NOT COMPLETE
  if (isLoggedIn && onboardingSession) {
    return <Navigate to="/basic-details" replace />;
  }

  // 🔒 VERIFIED-ONLY ROUTE CHECK
  // If manualVerification is false, block access to restricted routes via direct URL
  if (!manualVerification) {
    const isRestricted = VERIFIED_ONLY_ROUTES.some((route) =>
      location.pathname.startsWith(route),
    );
    if (isRestricted) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // ✅ ALLOW ACCESS
  return <Outlet />;
};

export default PrivateRoute;
