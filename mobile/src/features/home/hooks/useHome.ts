import { useQuery } from "@tanstack/react-query";

import { alertsApi } from "../../../api";
import { homeQueryKeys } from "../constants/queryKeys";

export const useHome = () => {
  const alertsQuery = useQuery({
    queryKey: homeQueryKeys.alerts,
    queryFn: alertsApi.getActive,
    placeholderData: [],
    retry: 1,
    staleTime: 60 * 1000,
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isFetching && !alertsQuery.data?.length,
    isError: alertsQuery.isError,
  };
};
