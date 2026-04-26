import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "../../../api/schedule.api";

const QUERY_KEY = ["admin-default-hours"] as const;

export const useDefaultHours = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: scheduleApi.getDefaultHours,
    staleTime: 5 * 60 * 1000,
  });

  const addHour = useMutation({
    mutationFn: (dto: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }) => scheduleApi.createDefaultHour(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const removeHour = useMutation({
    mutationFn: (id: string) => scheduleApi.deleteDefaultHour(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    defaultHours: query.data ?? [],
    isLoading: query.isLoading,
    addHour,
    removeHour,
  };
};
