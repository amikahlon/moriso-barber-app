import { useQuery } from "@tanstack/react-query";
import { scheduleApi } from "../../../api";
import { bookingQueryKeys } from "../constants/queryKeys";

export const useOpenDays = () => {
  return useQuery({
    queryKey: bookingQueryKeys.openDays,
    queryFn: scheduleApi.getOpenDays,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000,
  });
};
