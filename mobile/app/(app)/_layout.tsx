import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";

import { ScreenLoader } from "../../src/components/common";
import {
  DrawerContent,
  appDrawerScreenOptions,
  drawerScreens,
} from "../../src/features/navigation";
import { useCurrentUserQuery } from "../../src/features/auth/hooks";
import { useAuth } from "../../src/hooks";

export default function AppLayout() {
  const { isAuthReady, isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();

  if (!isAuthReady) return <ScreenLoader />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (currentUserQuery.isLoading) return <ScreenLoader />;
  if (currentUserQuery.data?.role === "admin") {
    return <Redirect href="/(admin)/home" />;
  }

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContent onClose={() => props.navigation.closeDrawer()} />
      )}
      screenOptions={appDrawerScreenOptions}
    >
      {drawerScreens.map((screen) => (
        <Drawer.Screen
          key={screen.key}
          name={screen.key}
          options={{
            drawerLabel: screen.label,
          }}
        />
      ))}
    </Drawer>
  );
}
