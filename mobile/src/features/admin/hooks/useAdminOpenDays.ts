import { useQuery } from "@tanstack/react-query";

import { scheduleApi } from "../../../api";

export const useAdminOpenDays = () => {
  return useQuery({
    queryKey: ["admin-open-days"],
    queryFn: scheduleApi.getOpenDays,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
};
