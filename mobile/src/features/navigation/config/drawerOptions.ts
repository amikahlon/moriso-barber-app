import { Dimensions } from "react-native";
import type { DrawerNavigationOptions } from "@react-navigation/drawer";

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.68, 300);

export const appDrawerWidth = DRAWER_WIDTH;

export const appDrawerScreenOptions: DrawerNavigationOptions = {
  headerShown: false,
  drawerPosition: "right",
  drawerType: "front",
  swipeEnabled: true,
  swipeEdgeWidth: 32,
  overlayColor: "rgba(14,14,16,0.6)",
  drawerStyle: {
    width: DRAWER_WIDTH,
    backgroundColor: "transparent",
  },
  sceneStyle: {
    backgroundColor: "transparent",
  },
  drawerItemStyle: {
    display: "none",
  },
};
