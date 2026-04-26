export type AppDrawerScreenName =
  | "home"
  | "booking"
  | "my-bookings"
  | "profile";

export type AdminDrawerScreenName =
  | "home"
  | "schedule"
  | "open-days"
  | "services"
  | "alerts"
  | "users"
  | "settings";

export type AppDrawerRoute = `/(app)/${AppDrawerScreenName}`;
export type AdminDrawerRoute = `/(admin)/${AdminDrawerScreenName}`;
export type DrawerRoute = AppDrawerRoute | AdminDrawerRoute | "navigate";

export interface DrawerItem {
  key: AppDrawerScreenName | AdminDrawerScreenName | "navigate";
  label: string;
  route: DrawerRoute;
}

export const drawerItems: DrawerItem[] = [
  { key: "home", label: "ראשי", route: "/(app)/home" },
  { key: "booking", label: "הזמנת תור", route: "/(app)/booking" },
  { key: "my-bookings", label: "התורים שלי", route: "/(app)/my-bookings" },
  { key: "profile", label: "הגדרות", route: "/(app)/profile" },
];

export const adminDrawerItems: DrawerItem[] = [
  { key: "home", label: "לוח ניהול", route: "/(admin)/home" },
  { key: "schedule", label: "יומן תורים", route: "/(admin)/schedule" },
  { key: "open-days", label: "ניהול ימים", route: "/(admin)/open-days" },
  { key: "services", label: "שירותים", route: "/(admin)/services" },
  { key: "alerts", label: "הודעות ועדכונים", route: "/(admin)/alerts" },
  { key: "users", label: "משתמשים", route: "/(admin)/users" },
  { key: "settings", label: "הגדרות עסק", route: "/(admin)/settings" },
];
export const drawerScreens = drawerItems.filter(
  (
    item,
  ): item is DrawerItem & {
    key: AppDrawerScreenName;
    route: AppDrawerRoute;
  } => item.route !== "navigate",
);

export const adminDrawerScreens = adminDrawerItems.filter(
  (
    item,
  ): item is DrawerItem & {
    key: AdminDrawerScreenName;
    route: AdminDrawerRoute;
  } => item.route !== "navigate",
);

export function normalizeDrawerRoute(route: string) {
  return route.replace("/(app)", "").replace("/(admin)", "");
}
