import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../authStorage";

const OtpRoute = () => {
  const otpSession = sessionStorage.getItem("otpSession");

  // already logged in → no OTP screen
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  // OTP not initiated → block access
  if (!otpSession) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default OtpRoute;
