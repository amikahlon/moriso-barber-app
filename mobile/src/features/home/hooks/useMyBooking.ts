import { useQuery } from "@tanstack/react-query";

import { bookingsApi } from "../../../api";
import { homeQueryKeys } from "../constants/queryKeys";

export const useMyBooking = () => {
  const query = useQuery({
    queryKey: homeQueryKeys.myBooking,
    queryFn: bookingsApi.getMyBooking,
    refetchInterval: 60 * 1000,
  });

  return {
    bookings: query.data ?? [],
    booking: query.data?.[0] ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
