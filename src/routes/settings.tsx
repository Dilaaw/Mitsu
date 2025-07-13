import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "./root";

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => <Outlet />,
});
