import { Redirect, Slot } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import { ScreenLoader } from "../../src/components/common";
import { colors, spacing } from "../../src/constants";
import { useCurrentUserQuery } from "../../src/features/auth/hooks";
import { getHomeRouteForRole } from "../../src/features/auth/utils/getHomeRouteForRole";
import { useAuth } from "../../src/hooks";

export default function AuthLayout() {
  const { isAuthReady, isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();

  if (!isAuthReady) {
    return <ScreenLoader />;
  }

  if (isAuthenticated) {
    if (currentUserQuery.isLoading) {
      return <ScreenLoader />;
    }

    return <Redirect href={getHomeRouteForRole(currentUserQuery.data?.role)} />;
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <Slot />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
});
