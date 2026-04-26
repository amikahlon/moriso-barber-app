import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../../../api";

export const useBookingsByDate = (date?: string) => {
  return useQuery({
    queryKey: ["admin-bookings", date],
    queryFn: () => bookingsApi.getAllByDate(date ?? ""),
    enabled: !!date,
    staleTime: 60 * 1000,
  });
};
