import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "../../../api/users.api";
import { useAuth } from "../../../hooks";
import { clearAuthQueries } from "../constants/queryKeys";

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await usersApi.removeMe();
      clearAuthQueries(queryClient);
      await signOut();
    },
  });
};
