import { apiClient } from "./client";
import type { BusinessSettings } from "../types";

interface RawSettings {
  id: string;
  slot_interval_minutes: number;
  min_cancel_notice_minutes: number;
  timezone: string;
  address: string;
  google_maps_url: string;
  phone: string;
  is_booking_enabled: boolean;
  updated_at: string;
  business_name: string;
  instagram_url: string;
  facebook_url: string;
  logo_url: string;
}

const mapSettings = (raw: RawSettings): BusinessSettings => ({
  id: raw.id,
  slotIntervalMinutes: raw.slot_interval_minutes,
  minCancelNoticeMinutes: raw.min_cancel_notice_minutes,
  timezone: raw.timezone,
  address: raw.address,
  googleMapsUrl: raw.google_maps_url,
  phone: raw.phone,
  isBookingEnabled: raw.is_booking_enabled,
  businessName: raw.business_name,
  instagramUrl: raw.instagram_url,
  facebookUrl: raw.facebook_url,
  logoUrl: raw.logo_url,
});

export const settingsApi = {
  get: async (): Promise<BusinessSettings> => {
    const { data } = await apiClient.get<RawSettings>("/settings", {
      skipAuth: true,
      skipUnauthorizedHandler: true,
    });
    return mapSettings(data);
  },

  update: async (
    dto: Partial<Omit<BusinessSettings, "id">>,
  ): Promise<BusinessSettings> => {
    const { data } = await apiClient.patch<RawSettings>("/settings", dto);
    return mapSettings(data);
  },
};
