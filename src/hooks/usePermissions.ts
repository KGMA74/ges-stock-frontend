import { Permission } from "@/lib/types"
import api from "@/services/api"
import { useQuery } from "@tanstack/react-query"

const fetchPermissions = async () => {
  const { data } = await api.get<Permission[]>("/permissions")
  return data
}

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  })
}
