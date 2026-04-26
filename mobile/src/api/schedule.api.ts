import { apiClient } from "./client";
import type { TimeSlot } from "../types";

export interface CustomDayHour {
  id: string;
  openDayId: string;
  startTime: string;
  endTime: string;
}

export interface BlockedTimeRange {
  id: string;
  openDayId: string;
  startTime: string;
  endTime: string;
}

export interface OpenDay {
  id: string;
  date: string;
  customDayHours: CustomDayHour[];
  blockedTimeRanges: BlockedTimeRange[];
}

export interface DefaultHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface RawTimeRange {
  id: string;
  open_day_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface RawOpenDay {
  id: string;
  date: string;
  created_at: string;
  custom_day_hours: RawTimeRange[];
  blocked_time_ranges: RawTimeRange[];
}

interface RawDefaultHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

const extractTime = (raw: string): string => {
  if (raw.includes("T")) return raw.split("T")[1].slice(0, 5);
  return raw.slice(0, 5);
};

const mapTimeRange = (raw: RawTimeRange): CustomDayHour => ({
  id: raw.id,
  openDayId: raw.open_day_id,
  startTime: extractTime(raw.start_time),
  endTime: extractTime(raw.end_time),
});

const mapOpenDay = (raw: RawOpenDay): OpenDay => ({
  id: raw.id,
  date: raw.date.split("T")[0],
  customDayHours: (raw.custom_day_hours ?? []).map(mapTimeRange),
  blockedTimeRanges: (raw.blocked_time_ranges ?? []).map(mapTimeRange),
});

const mapDefaultHour = (raw: RawDefaultHour): DefaultHour => ({
  id: raw.id,
  dayOfWeek: raw.day_of_week,
  startTime: extractTime(raw.start_time),
  endTime: extractTime(raw.end_time),
});

export const scheduleApi = {
  getOpenDays: async (): Promise<OpenDay[]> => {
    const { data } = await apiClient.get<RawOpenDay[]>("/schedule/open-days");
    return data.map(mapOpenDay);
  },

  createOpenDay: async (date: string): Promise<OpenDay> => {
    const { data } = await apiClient.post<RawOpenDay>("/schedule/open-days", {
      date,
    });
    return mapOpenDay({
      ...data,
      custom_day_hours: [],
      blocked_time_ranges: [],
    });
  },

  deleteOpenDay: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedule/open-days/${id}`);
  },

  getDefaultHours: async (): Promise<DefaultHour[]> => {
    const { data } = await apiClient.get<RawDefaultHour[]>(
      "/schedule/default-hours",
    );
    return data.map(mapDefaultHour);
  },

  createDefaultHour: async (dto: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<DefaultHour> => {
    const { data } = await apiClient.post<RawDefaultHour>(
      "/schedule/default-hours",
      dto,
    );
    return mapDefaultHour(data);
  },

  deleteDefaultHour: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedule/default-hours/${id}`);
  },

  createCustomDayHour: async (dto: {
    openDayId: string;
    startTime: string;
    endTime: string;
  }): Promise<CustomDayHour> => {
    const { data } = await apiClient.post<RawTimeRange>(
      "/schedule/custom-day-hours",
      dto,
    );
    return mapTimeRange(data);
  },

  deleteCustomDayHour: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedule/custom-day-hours/${id}`);
  },

  createBlockedTime: async (dto: {
    openDayId: string;
    startTime: string;
    endTime: string;
  }): Promise<BlockedTimeRange> => {
    const { data } = await apiClient.post<RawTimeRange>(
      "/schedule/blocked-times",
      dto,
    );
    return mapTimeRange(data);
  },

  deleteBlockedTime: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedule/blocked-times/${id}`);
  },

  getSlots: async (
    date: string,
    serviceDuration: number,
  ): Promise<TimeSlot[]> => {
    const dateOnly = date.split("T")[0];
    const { data } = await apiClient.get<TimeSlot[]>(
      `/schedule/slots?date=${dateOnly}&serviceDuration=${serviceDuration}`,
    );
    return data;
  },
};
