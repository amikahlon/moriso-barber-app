import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "../../../api/schedule.api";

const OPEN_DAYS_KEY = ["admin-open-days"] as const;

export const useDaySchedule = (openDayId: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: OPEN_DAYS_KEY });
  };

  const addCustomHour = useMutation({
    mutationFn: (dto: { startTime: string; endTime: string }) =>
      scheduleApi.createCustomDayHour({ openDayId, ...dto }),
    onSuccess: invalidate,
  });

  const removeCustomHour = useMutation({
    mutationFn: (id: string) => scheduleApi.deleteCustomDayHour(id),
    onSuccess: invalidate,
  });

  const addBlockedTime = useMutation({
    mutationFn: (dto: { startTime: string; endTime: string }) =>
      scheduleApi.createBlockedTime({ openDayId, ...dto }),
    onSuccess: invalidate,
  });

  const removeBlockedTime = useMutation({
    mutationFn: (id: string) => scheduleApi.deleteBlockedTime(id),
    onSuccess: invalidate,
  });

  return {
    addCustomHour,
    removeCustomHour,
    addBlockedTime,
    removeBlockedTime,
  };
};
