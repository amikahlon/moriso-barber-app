import type { QueryClient } from "@tanstack/react-query";

import { supabase } from "../../../lib/supabase";
import type { AuthResponse } from "../../../types";
import { authQueryKeys, clearAuthQueries } from "../constants/queryKeys";

export const completeAuthSession = async (
  response: AuthResponse,
  queryClient: QueryClient,
) => {
  if (response.user) {
    queryClient.setQueryData(authQueryKeys.currentUser, response.user);
  }

  const { error } = await supabase.auth.setSession({
    access_token: response.accessToken,
    refresh_token: response.refreshToken,
  });

  if (error) {
    clearAuthQueries(queryClient);
    throw error;
  }
};
