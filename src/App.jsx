import classes from "./App.module.scss";
import { useEffect } from "react";
import VerifyOtp from "./screens/public/VerifyOtp/VerifyOtp";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { PATH } from "./utils/routes/Paths";
import { flattenRoutes } from "./utils/routes/flattenRoutes";

import PublicRoute from "./utils/routes/PublicRoute";
import PrivateRoute from "./utils/routes/PrivateRoute";
import OtpRoute from "./utils/routes/OtpRoute";

import HomeLayout from "./layouts/HomeLayout";

function App() {
  const router = createBrowserRouter([
    /* -------- PUBLIC ROUTES -------- */
    {
      element: <PublicRoute />,
      children: Object.values(PATH.publicRoutes).map((route) => ({
        path: route.path,
        element: <route.element />,
      })),
    },

    /* -------- OTP ROUTE (SPECIAL) -------- */
    {
      element: <OtpRoute />,
      children: [
        {
          path: "/verify-otp",
          element: <VerifyOtp />,
        },
      ],
    },

    /* -------- PRIVATE ROUTES -------- */
    {
      element: <PrivateRoute />,
      children: [
        {
          element: <HomeLayout />,
          children: flattenRoutes(PATH.privateRoutes).map((child) => ({
            path: child.path,
            element: <child.element />,
            handle: {
              header: child.header ?? true,
              footer: child.footer ?? true,
            },
          })),
        },
      ],
    },

    /* -------- FALLBACK -------- */
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .pac-container {
        z-index: 999999 !important;
        position: absolute !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className={classes.app}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
