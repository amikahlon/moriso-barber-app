import { useQuery } from "@tanstack/react-query";
import { scheduleApi } from "../../../api";
import { bookingQueryKeys } from "../constants/queryKeys";

interface UseAvailableSlotsProps {
  date: string | null;
  durationMinutes: number | null;
}

export const useAvailableSlots = ({
  date,
  durationMinutes,
}: UseAvailableSlotsProps) => {
  return useQuery({
    queryKey: bookingQueryKeys.slots(date ?? "", durationMinutes ?? 0),
    queryFn: () => scheduleApi.getSlots(date!, durationMinutes!),
    enabled: !!date && !!durationMinutes,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    refetchInterval: date && durationMinutes ? 15 * 1000 : false,
  });
};
