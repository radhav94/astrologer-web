import classes from "./App.module.scss";
import { useEffect } from "react";
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

// 🔹 OTP & Onboarding Screens
import VerifyOtp from "./screens/public/VerifyOtp/VerifyOtp";
import BasicDetails from "./screens/public/BasicDetails/BasicDetails";
import ProfessionalDetails from "./screens/public/BasicDetails/ProfessionalDetails";
import LanguagesYouSpeak from "./screens/public/BasicDetails/LanguagesYouSpeak";
import Education from "./screens/public/BasicDetails/Education";
import Achievements from "./screens/public/BasicDetails/Achievements";
import AreaOfExpertise from "./screens/public/BasicDetails/AreaOfExpertise";
import VerifyProfile from "./screens/public/BasicDetails/VerifyProfile";
import VerificationPending from "./screens/public/BasicDetails/VerificationPending";

function App() {
  const router = createBrowserRouter([
    /* ================= PUBLIC ROUTES ================= */
    {
      element: <PublicRoute />,
      children: Object.values(PATH.publicRoutes).map((route) => ({
        path: route.path,
        element: <route.element />,
      })),
    },

    /* ================= OTP + ONBOARDING ROUTES ================= */
    {
      element: <OtpRoute />,
      children: [
        { path: "/verify-otp", element: <VerifyOtp /> },
        { path: "/basic-details", element: <BasicDetails /> },
        { path: "/professional-details", element: <ProfessionalDetails /> },
        { path: "/language-speak", element: <LanguagesYouSpeak /> },
        { path: "/education", element: <Education /> },
        { path: "/achievements", element: <Achievements /> },
        { path: "/areaofexpertise", element: <AreaOfExpertise /> },
        { path: "/verifyprofile", element: <VerifyProfile /> },
        { path: "/verificationpending", element: <VerificationPending /> },
      ],
    },

    /* ================= PRIVATE ROUTES ================= */
    {
      element: <PrivateRoute />,
      children: [
        {
          element: <HomeLayout />,
          children: flattenRoutes(PATH.privateRoutes)
            .filter(
              (route) =>
                ![
                  "/basic-details",
                  "/professional-details",
                  "/language-speak",
                  "/education",
                  "/achievements",
                  "/areaofexpertise",
                  "/verifyprofile",
                  "/verificationpending",
                ].includes(route.path)
            )
            .map((child) => ({
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

    /* ================= FALLBACK ================= */
    { path: "*", element: <Navigate to="/" replace /> },
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
