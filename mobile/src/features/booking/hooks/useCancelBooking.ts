import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bookingsApi } from "../../../api";
import { homeQueryKeys } from "../../home/constants/queryKeys";

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancel(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: homeQueryKeys.myBooking,
      });
    },
  });
};
