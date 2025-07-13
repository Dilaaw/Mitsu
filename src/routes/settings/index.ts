import { createRoute } from "@tanstack/react-router";
import { settingsRoute } from "../settings";
import SettingsIndex from "../../pages/Settings/Index";

export const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/",
  component: SettingsIndex,
});
