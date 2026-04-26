import type { User } from "../../../types";

export const getHomeRouteForRole = (role?: User["role"]) =>
  role === "admin" ? "/(admin)/home" : "/(app)/home";
