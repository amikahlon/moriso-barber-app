import { apiClient } from "./client";

export type PushTokenPlatform = "ios" | "android";

export interface PushTokenDto {
  token: string;
  platform: PushTokenPlatform;
}

export const notificationsApi = {
  registerPushToken: async (dto: PushTokenDto): Promise<void> => {
    await apiClient.post("/notifications/push-token", dto);
  },

  removePushToken: async (dto: PushTokenDto): Promise<void> => {
    await apiClient.delete("/notifications/push-token", {
      data: dto,
      skipUnauthorizedHandler: true,
    } as never);
  },
};
