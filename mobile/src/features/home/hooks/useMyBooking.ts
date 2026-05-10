import { useQuery } from "@tanstack/react-query";

import { bookingsApi } from "../../../api";
import { useAuth } from "../../../hooks";
import { homeQueryKeys } from "../constants/queryKeys";
import { getUpcomingBookings } from "../utils/bookings";

export const useMyBooking = () => {
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: homeQueryKeys.myBooking,
    queryFn: bookingsApi.getMyBooking,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60 * 1000 : false,
  });

  const upcomingBookings = getUpcomingBookings(query.data ?? []);

  return {
    bookings: upcomingBookings,
    booking: upcomingBookings[0] ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
