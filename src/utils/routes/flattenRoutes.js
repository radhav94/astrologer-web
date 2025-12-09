// Helper function to flatten nested routes
export const flattenRoutes = (routes) => {
  const flattened = [];

  Object.values(routes).forEach((route) => {
    if (!route || typeof route !== "object") return;

    // Handle array or single path
    const paths = Array.isArray(route.path) ? route.path : [route.path];

    if (route.element && paths[0]) {
      paths.forEach((p) => {
        flattened.push({ ...route, path: p });
      });
    }

    // Handle nested routes (like HOROSCOPE.DAILY, HOROSCOPE.MONTHLY)
    Object.values(route).forEach((nestedRoute) => {
      if (nestedRoute && typeof nestedRoute === "object") {
        const nestedPaths = Array.isArray(nestedRoute.path)
          ? nestedRoute.path
          : [nestedRoute.path];
        if (nestedRoute.element && nestedPaths[0]) {
          nestedPaths.forEach((p) => {
            flattened.push({ ...nestedRoute, path: p });
          });
        }
      }
    });
  });

  return flattened;
};
