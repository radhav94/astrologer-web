import { Navigate, Outlet, useLocation } from "react-router-dom";

const OtpRoute = () => {
  const isLoggedIn = !!localStorage.getItem("shubhtalk_astro_token");
  const otpSession = sessionStorage.getItem("otpSession");
  const onboardingSession = sessionStorage.getItem("onboardingSession");
  const location = useLocation();

  const onboardingRoutes = [
    "/basic-details",
    "/professional-details",
    "/language-speak",
    "/education",
    "/achievements",
    "/areaofexpertise",
    "/kyc-verification",
    "/verifyprofile",
    "/verificationpending",
  ];

  /* 🔒 OTP PAGE */
  if (location.pathname === "/verify-otp" && !otpSession) {
    return <Navigate to="/" replace />;
  }

  /* 🔒 ONBOARDING PAGES */
  if (onboardingRoutes.includes(location.pathname) && !onboardingSession) {
    return <Navigate to="/" replace />;
  }

  /* 🔒 LOGGED IN USERS (EXCEPT ONBOARDING) */
  if (isLoggedIn && !onboardingSession && location.pathname !== "/verify-otp") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default OtpRoute;
