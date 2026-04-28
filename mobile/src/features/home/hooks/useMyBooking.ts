import { useQuery } from "@tanstack/react-query";

import { bookingsApi } from "../../../api";
import { useAuth } from "../../../hooks";
import { homeQueryKeys } from "../constants/queryKeys";

export const useMyBooking = () => {
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: homeQueryKeys.myBooking,
    queryFn: bookingsApi.getMyBooking,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60 * 1000 : false,
  });

  return {
    bookings: query.data ?? [],
    booking: query.data?.[0] ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
