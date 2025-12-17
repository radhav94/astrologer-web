// utils/routes/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const isLoggedIn = !!localStorage.getItem("shubhtalk_astro_token");
  const onboardingSession = sessionStorage.getItem("onboardingSession");

  if (isLoggedIn && !onboardingSession) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
