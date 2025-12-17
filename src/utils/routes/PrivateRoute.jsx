// utils/routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = () => {
  const isLoggedIn = !!localStorage.getItem("shubhtalk_astro_token");
  const onboardingSession = sessionStorage.getItem("onboardingSession");
  const location = useLocation();

  // 🔒 NOT LOGGED IN → LOGIN
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔒 LOGGED IN BUT ONBOARDING NOT COMPLETE
  if (isLoggedIn && onboardingSession) {
    return <Navigate to="/basic-details" replace />;
  }

  // ✅ ALLOW ACCESS
  return <Outlet />;
};

export default PrivateRoute;
