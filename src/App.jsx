import classes from "./App.module.scss";

import { PATH } from "./utils/routes/Paths";
import HomeLayout from "./layouts/HomeLayout";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import PublicRoute from "./utils/routes/PublicRoute";
import PrivateRoute from "./utils/routes/PrivateRoute";
import { useEffect } from "react";
import { flattenRoutes } from "./utils/routes/flattenRoutes";

function App() {
  const roleWiseRouting = createBrowserRouter([
    //public routes
    ...Object.values(PATH.publicRoutes).map((route) => ({
      path: route.path,
      element: <PublicRoute component={route.element} />,
    })),

    {
      //private routes
      path: "/",
      element: <PrivateRoute component={HomeLayout} />,
      children: [
        ...flattenRoutes(PATH.privateRoutes).map((child) => ({
          path: child.path,
          element: <child.element />,
          handle: {
            header: child.header ?? true,
            footer: child.footer ?? true,
          },
        })),
        {
          path: "/",
          element: <Navigate to="/" />,
        },
        {
          path: "*",
          element: <Navigate to="/" />,
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" />,
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
      <RouterProvider router={roleWiseRouting} />
    </div>
  );
}

export default App;
