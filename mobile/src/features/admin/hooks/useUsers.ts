import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../../../api/users.api";

export const useUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: usersApi.getAll,
    staleTime: 2 * 60 * 1000,
  });
};
