import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../authStorage";

const PublicRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
