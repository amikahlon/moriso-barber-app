import { useQuery } from "@tanstack/react-query";

import { alertsApi } from "../../../api";
import { homeQueryKeys } from "../constants/queryKeys";

export const useHome = () => {
  const alertsQuery = useQuery({
    queryKey: homeQueryKeys.alerts,
    queryFn: alertsApi.getActive,
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    isError: alertsQuery.isError,
  };
};
