import { apiClient } from "./client";
import type { Alert } from "../types";

interface RawAlert {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const mapAlert = (raw: RawAlert): Alert => ({
  id: raw.id,
  title: raw.title,
  body: raw.body,
  isActive: raw.is_active,
  expiresAt: raw.expires_at ?? undefined,
  createdAt: raw.created_at,
});

export const alertsApi = {
  getActive: async (): Promise<Alert[]> => {
    const { data } = await apiClient.get<RawAlert[]>("/alerts/active", {
      skipAuth: true,
      skipUnauthorizedHandler: true,
    });
    return data.map(mapAlert);
  },

  getAll: async (): Promise<Alert[]> => {
    const { data } = await apiClient.get<RawAlert[]>("/alerts");
    return data.map(mapAlert);
  },

  create: async (dto: {
    title: string;
    body: string;
    isActive?: boolean;
    expiresAt?: string;
  }): Promise<Alert> => {
    const { data } = await apiClient.post<RawAlert>("/alerts", dto);
    return mapAlert(data);
  },

  update: async (
    id: string,
    dto: {
      title?: string;
      body?: string;
      isActive?: boolean;
      expiresAt?: string | null;
    },
  ): Promise<Alert> => {
    const { data } = await apiClient.patch<RawAlert>(`/alerts/${id}`, dto);
    return mapAlert(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/alerts/${id}`);
  },
};
