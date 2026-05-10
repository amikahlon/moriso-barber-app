import { useQuery } from "@tanstack/react-query";
import { scheduleApi } from "../../../api";
import {
  normalizeDateKey,
  parseDateKey,
} from "../../../utils/calendar";
import { bookingQueryKeys } from "../constants/queryKeys";

export const useOpenDays = () => {
  return useQuery({
    queryKey: bookingQueryKeys.openDays,
    queryFn: scheduleApi.getOpenDays,
    select: (openDays) => {
      const todayKey = normalizeDateKey(new Date());

      return openDays
        .filter((day) => normalizeDateKey(parseDateKey(day.date)) >= todayKey)
        .sort((a, b) =>
          normalizeDateKey(parseDateKey(a.date)).localeCompare(
            normalizeDateKey(parseDateKey(b.date)),
          ),
        );
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000,
  });
};
