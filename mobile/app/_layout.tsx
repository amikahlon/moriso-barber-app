import { Stack } from "expo-router";
import { I18nManager, StatusBar } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "../src/features/auth/providers/AuthProvider";

if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

if (typeof I18nManager.swapLeftAndRightInRTL === "function") {
  I18nManager.swapLeftAndRightInRTL(true);
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar barStyle="light-content" />
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
