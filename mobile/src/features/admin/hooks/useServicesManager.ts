import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "../../../api/services.api";
import type { Service } from "../../../types";

const QUERY_KEY = ["admin-services"] as const;

export const useServicesManager = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["services"] });
    void queryClient.invalidateQueries({ queryKey: ["booking-services"] });
  };

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => servicesApi.getAll(false),
    staleTime: 2 * 60 * 1000,
  });

  const createService = useMutation({
    mutationFn: (dto: Parameters<typeof servicesApi.create>[0]) =>
      servicesApi.create(dto),
    onSuccess: invalidate,
  });

  const updateService = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: Parameters<typeof servicesApi.update>[1];
    }) => servicesApi.update(id, dto),
    onSuccess: invalidate,
  });

  const deleteService = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: invalidate,
  });

  return {
    services: query.data ?? [],
    isLoading: query.isLoading,
    createService,
    updateService,
    deleteService,
  };
};
