import { Redirect } from "expo-router";

import { ScreenLoader } from "../src/components/common";
import { useCurrentUserQuery } from "../src/features/auth/hooks";
import { getHomeRouteForRole } from "../src/features/auth/utils/getHomeRouteForRole";
import { useAuth } from "../src/hooks";

export default function Index() {
  const { isAuthReady, isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();

  if (!isAuthReady) {
    return <ScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }

  if (currentUserQuery.isLoading) {
    return <ScreenLoader />;
  }

  return <Redirect href={getHomeRouteForRole(currentUserQuery.data?.role)} />;
}
