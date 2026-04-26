import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../../../api";
import { homeQueryKeys } from "../../home/constants/queryKeys";
import { useBookingStore } from "../../../store/booking.store";
import type { CreateBookingDto } from "../../../types";

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const resetBookingFlow = useBookingStore((s) => s.resetBookingFlow);

  return useMutation({
    mutationFn: (dto: CreateBookingDto) => bookingsApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: homeQueryKeys.myBooking,
      });
      resetBookingFlow();
    },
  });
};
