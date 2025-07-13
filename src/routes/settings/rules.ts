import { createRoute } from "@tanstack/react-router";
import { settingsRoute } from "../settings";
import Rules from "../../pages/Settings/Rules";

export const rulesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/rules",
  component: Rules,
});
