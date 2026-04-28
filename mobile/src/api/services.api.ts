import { apiClient } from "./client";
import type { Service } from "../types";

interface RawService {
  id: string;
  name: string;
  price: string | number;
  duration_minutes: number;
  is_active: boolean;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const mapService = (raw: RawService): Service => ({
  id: raw.id,
  name: raw.name,
  price: Number(raw.price),
  durationMinutes: raw.duration_minutes,
  isActive: raw.is_active,
  description: raw.description ?? undefined,
  sortOrder: raw.sort_order,
});

export const servicesApi = {
  getAll: async (onlyActive = false): Promise<Service[]> => {
    const { data } = await apiClient.get<RawService[]>(
      `/services${onlyActive ? "?onlyActive=true" : ""}`,
      onlyActive
        ? {
            skipAuth: true,
            skipUnauthorizedHandler: true,
          }
        : undefined,
    );
    return data.map(mapService);
  },

  create: async (dto: {
    name: string;
    price: number;
    durationMinutes: number;
    description?: string;
    sortOrder?: number;
  }): Promise<Service> => {
    const { data } = await apiClient.post<RawService>("/services", dto);
    return mapService(data);
  },

  update: async (
    id: string,
    dto: {
      name?: string;
      price?: number;
      durationMinutes?: number;
      description?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ): Promise<Service> => {
    const { data } = await apiClient.patch<RawService>(`/services/${id}`, dto);
    return mapService(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },
};
