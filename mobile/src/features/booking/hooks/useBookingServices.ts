import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "../../../api";
import { bookingQueryKeys } from "../constants/queryKeys";

export const useBookingServices = () => {
  return useQuery({
    queryKey: bookingQueryKeys.services,
    queryFn: () => servicesApi.getAll(true),
    staleTime: 10 * 60 * 1000,
  });
};
