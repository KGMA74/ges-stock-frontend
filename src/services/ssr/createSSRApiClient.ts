import { cookies } from "next/headers";
import { AxiosInstance } from "axios";
import api from "../api";

let cachedSSRApi: AxiosInstance | null = null;

const createSSRApiClient = async (): Promise<AxiosInstance> => {
  if (cachedSSRApi) return cachedSSRApi;

  const cookieStore = await cookies();
  const access = cookieStore.get("access");
  const refresh = cookieStore.get("refresh");

  const cookieHeader = [
    access ? `access=${access.value}` : "",
    refresh ? `refresh=${refresh.value}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  cachedSSRApi = api.create({
    headers: {
      Cookie: cookieHeader,
    },
    withCredentials: true,
  });

  return cachedSSRApi;
};

export default createSSRApiClient;
