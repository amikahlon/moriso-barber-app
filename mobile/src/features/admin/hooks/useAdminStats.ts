import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/client";
import type { Booking } from "../../../types";

interface AdminStats {
  todayBookings: number;
  activeBookings: number;
  totalServices: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      const today = new Date().toISOString().split("T")[0];

      const [todayRes, servicesRes] = await Promise.all([
        apiClient.get<Booking[]>(`/bookings/by-date?date=${today}`),
        apiClient.get<{ id: string }[]>("/services"),
      ]);

      return {
        todayBookings: todayRes.data.length,
        activeBookings: todayRes.data.filter((b) => b.status === "active")
          .length,
        totalServices: servicesRes.data.length,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};
