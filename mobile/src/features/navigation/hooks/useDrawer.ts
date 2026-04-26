import { useNavigation } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";

type MaybeDrawerNavigation = NavigationProp<ParamListBase> & {
  getParent?: () => MaybeDrawerNavigation | undefined;
  openDrawer?: () => void;
  closeDrawer?: () => void;
  toggleDrawer?: () => void;
};

function findDrawerNavigation(
  navigation: MaybeDrawerNavigation,
): MaybeDrawerNavigation | undefined {
  let current: MaybeDrawerNavigation | undefined = navigation;

  while (current) {
    if (
      typeof current.openDrawer === "function" &&
      typeof current.closeDrawer === "function" &&
      typeof current.toggleDrawer === "function"
    ) {
      return current;
    }

    current = current.getParent?.();
  }

  return undefined;
}

export function useDrawer() {
  const navigation = useNavigation<MaybeDrawerNavigation>();
  const drawerNavigation = findDrawerNavigation(navigation);

  return {
    open: () => drawerNavigation?.openDrawer?.(),
    close: () => drawerNavigation?.closeDrawer?.(),
    toggle: () => drawerNavigation?.toggleDrawer?.(),
  };
}
