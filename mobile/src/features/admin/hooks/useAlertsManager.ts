import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "../../../api/alerts.api";

const QUERY_KEY = ["admin-alerts"] as const;

export const useAlertsManager = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["alerts"] });
  };

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: alertsApi.getAll,
    staleTime: 2 * 60 * 1000,
  });

  const createAlert = useMutation({
    mutationFn: (dto: Parameters<typeof alertsApi.create>[0]) =>
      alertsApi.create(dto),
    onSuccess: invalidate,
  });

  const updateAlert = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: Parameters<typeof alertsApi.update>[1];
    }) => alertsApi.update(id, dto),
    onSuccess: invalidate,
  });

  const deleteAlert = useMutation({
    mutationFn: (id: string) => alertsApi.delete(id),
    onSuccess: invalidate,
  });

  return {
    alerts: query.data ?? [],
    isLoading: query.isLoading,
    createAlert,
    updateAlert,
    deleteAlert,
  };
};
