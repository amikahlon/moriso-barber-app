import { useQueries } from "@tanstack/react-query";

import { bookingsApi } from "../../../api";

export const useBookingsForOpenDays = (dateKeys: string[]) => {
  const queries = useQueries({
    queries: dateKeys.map((dateKey) => ({
      queryKey: ["admin-bookings", dateKey],
      queryFn: () => bookingsApi.getAllByDate(dateKey),
      staleTime: 60 * 1000,
    })),
  });

  return {
    groups: dateKeys.map((dateKey, index) => ({
      dateKey,
      bookings: queries[index]?.data ?? [],
      isLoading: queries[index]?.isLoading ?? false,
      isFetching: queries[index]?.isFetching ?? false,
    })),
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
  };
};
