import { apiClient } from "./client";
import type { Booking, CreateBookingDto } from "../types";

interface RawBookingService {
  id: string;
  name: string;
  price?: number | string;
  duration_minutes: number;
}

interface RawBookingUser {
  id: string;
  full_name: string;
  phone: string;
  email: string;
}

interface RawBooking {
  id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: Booking["status"];
  notes?: string | null;
  service_price_snapshot: number | string;
  service?: RawBookingService;
  services?: RawBookingService;
  users?: RawBookingUser;
  user?: RawBookingUser;
}

type RawBookingsResponse =
  | RawBooking[]
  | RawBooking
  | {
      bookings?: RawBookingsResponse;
      data?: RawBookingsResponse;
      items?: RawBookingsResponse;
      results?: RawBookingsResponse;
    }
  | null;

const extractTime = (raw: string): string => {
  if (raw.includes("T")) return raw.split("T")[1].slice(0, 5);
  return raw.slice(0, 5);
};

const isRawBooking = (data: unknown): data is RawBooking =>
  !!data &&
  typeof data === "object" &&
  "id" in data &&
  "booking_date" in data &&
  "start_time" in data;

const normalizeBookingsResponse = (data: RawBookingsResponse): RawBooking[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (isRawBooking(data)) return [data];

  const nestedResponses = [data.bookings, data.data, data.items, data.results];

  for (const nestedResponse of nestedResponses) {
    const bookings = normalizeBookingsResponse(nestedResponse ?? null);
    if (bookings.length > 0) return bookings;
  }

  return [];
};

const mapBooking = (raw: RawBooking): Booking => {
  const service = raw.services ?? raw.service;
  const user = raw.users ?? raw.user;

  return {
    id: raw.id,
    customerId: raw.customer_id,
    serviceId: raw.service_id,
    bookingDate: raw.booking_date,
    startTime: extractTime(raw.start_time),
    endTime: extractTime(raw.end_time),
    status: raw.status,
    notes: raw.notes ?? undefined,
    servicePriceSnapshot: Number(raw.service_price_snapshot),
    service: service
      ? {
          id: service.id,
          name: service.name,
          price: Number(service.price ?? raw.service_price_snapshot),
          durationMinutes: service.duration_minutes,
          sortOrder: 0,
          isActive: true,
        }
      : undefined,
    user: user
      ? {
          id: user.id,
          fullName: user.full_name,
          phone: user.phone,
          email: user.email,
        }
      : undefined,
  };
};

export const bookingsApi = {
  getMyBooking: async (): Promise<Booking[]> => {
    const { data } = await apiClient.get<RawBookingsResponse>("/bookings/my");
    return normalizeBookingsResponse(data).map(mapBooking);
  },

  getAllByDate: async (date: string): Promise<Booking[]> => {
    const { data } = await apiClient.get<RawBooking[]>(
      `/bookings/by-date?date=${date}`,
    );
    return data.map(mapBooking);
  },

  create: async (dto: CreateBookingDto): Promise<Booking> => {
    const { data } = await apiClient.post<RawBooking>("/bookings", dto);
    return mapBooking(data);
  },

  cancel: async (bookingId: string): Promise<Booking> => {
    const { data } = await apiClient.patch<RawBooking>(
      `/bookings/${bookingId}/cancel`,
    );
    return mapBooking(data);
  },

  cancelByAdmin: async (bookingId: string): Promise<Booking> => {
    const { data } = await apiClient.patch<RawBooking>(
      `/bookings/${bookingId}/cancel-by-admin`,
    );
    return mapBooking(data);
  },
};
