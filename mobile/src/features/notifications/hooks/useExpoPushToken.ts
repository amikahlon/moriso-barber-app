import { useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { notificationsApi, type PushTokenDto, type PushTokenPlatform } from "../../../api";

const PUSH_TOKEN_STORAGE_KEY = "moriso:expoPushToken";

export const useExpoPushToken = (enabled: boolean, userId?: string) => {
  useEffect(() => {
    if (!enabled) return;
    void registerForPushNotifications();
  }, [enabled, userId]);
};

export const unregisterExpoPushToken = async () => {
  const storedToken = await getStoredPushToken();

  if (!storedToken) {
    return;
  }

  try {
    await notificationsApi.removePushToken(storedToken);
  } catch (error) {
    console.warn("Push token unregister failed:", error);
  } finally {
    await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  }
};

const registerForPushNotifications = async () => {
  try {
    if (!Device.isDevice || !isNativePushPlatform(Platform.OS)) {
      console.log("Push notifications require a physical device");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("Missing projectId");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const nextToken: PushTokenDto = {
      token: tokenData.data,
      platform: Platform.OS,
    };

    const storedToken = await getStoredPushToken();

    if (storedToken && storedToken.token !== nextToken.token) {
      try {
        await notificationsApi.removePushToken(storedToken);
      } catch {
      }
    }

    await notificationsApi.registerPushToken(nextToken);
    await storePushToken(nextToken);

    console.log("Push token registered:", tokenData.data);
  } catch (error) {
    console.error("Push token registration failed:", error);
  }
};

const isNativePushPlatform = (
  platform: typeof Platform.OS,
): platform is PushTokenPlatform => platform === "ios" || platform === "android";

const getStoredPushToken = async (): Promise<PushTokenDto | null> => {
  const raw = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PushTokenDto;

    if (!parsed.token || !isNativePushPlatform(parsed.platform)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const storePushToken = (dto: PushTokenDto) =>
  AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, JSON.stringify(dto));
