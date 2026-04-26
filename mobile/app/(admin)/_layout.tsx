import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";

import { ScreenLoader } from "../../src/components/common";
import { useCurrentUserQuery } from "../../src/features/auth/hooks";
import {
  adminDrawerItems,
  adminDrawerScreens,
  appDrawerScreenOptions,
  DrawerContent,
} from "../../src/features/navigation";
import { useAuth } from "../../src/hooks";

export default function AdminLayout() {
  const { isAuthReady, isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();

  if (!isAuthReady) return <ScreenLoader />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (currentUserQuery.isLoading) return <ScreenLoader />;
  if (currentUserQuery.data?.role !== "admin") {
    return <Redirect href="/(app)/home" />;
  }

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContent
          items={adminDrawerItems}
          sectionLabel="ניהול"
          onClose={() => props.navigation.closeDrawer()}
        />
      )}
      screenOptions={appDrawerScreenOptions}
    >
      {adminDrawerScreens.map((screen) => (
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
