import type { QueryClient } from "@tanstack/react-query";

export const authQueryKeys = {
  currentUser: ["current-user"] as const,
};

export const clearAuthQueries = (queryClient: QueryClient) => {
  queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
  queryClient.removeQueries({ queryKey: ["my-booking"] });
};
