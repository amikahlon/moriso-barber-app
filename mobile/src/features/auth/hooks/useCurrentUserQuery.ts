import { useQuery } from "@tanstack/react-query";

import { authApi } from "../../../api";
import { useAuth } from "../../../hooks";
import { authQueryKeys } from "../constants/queryKeys";

export const useCurrentUserQuery = () => {
  const { session } = useAuth();

  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: authApi.getMe,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
