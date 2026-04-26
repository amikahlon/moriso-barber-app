import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../../../api/settings.api";

export const SETTINGS_KEY = ["settings"] as const;

export const useSettingsQuery = () => {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: settingsApi.get,
    staleTime: 10 * 60 * 1000,
  });
};
