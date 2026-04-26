import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bookingsApi } from "../../../api";

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancelByAdmin(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-bookings"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin-stats"],
      });
    },
  });
};
