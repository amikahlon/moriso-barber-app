import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "../../../api/schedule.api";

const QUERY_KEY = ["admin-open-days"] as const;

export const useOpenDaysManager = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: scheduleApi.getOpenDays,
    staleTime: 2 * 60 * 1000,
  });

  const addDay = useMutation({
    mutationFn: (date: string) => scheduleApi.createOpenDay(date),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const removeDay = useMutation({
    mutationFn: (id: string) => scheduleApi.deleteOpenDay(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    openDays: query.data ?? [],
    isLoading: query.isLoading,
    addDay,
    removeDay,
  };
};
