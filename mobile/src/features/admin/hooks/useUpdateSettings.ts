import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../../../api/settings.api";
import { SETTINGS_KEY } from "../../settings/hooks/useSettingsQuery";
import type { BusinessSettings } from "../../../types";

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Partial<Omit<BusinessSettings, "id">>) =>
      settingsApi.update(dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(SETTINGS_KEY, updated);
    },
  });
};
