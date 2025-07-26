import { User} from "@/lib/types";
import api from "@/services/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useFetchUsers = (page?: number) => {
  return useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const { data } = await api.get<User>("users/", {
        params: {
          page
        }
      });
      return data;
    },
  });
};
