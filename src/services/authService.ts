import { useAuthStore } from "@/store/authStore";
import api from "./api";
import { User } from "@/lib/types";

const set = useAuthStore.getState();

export const authService = {
  retrieveUser: async () => {
    try {
      set.setLoading(true);
      const { data } = await api.get<User>("users/me/");
      set.setAuth(data);
      return data;
    } catch (err) {
      set.setLogout();
      throw err;
    } finally {
      set.setLoading(false);
    }
  },

  login: async (credentials: { store_name: string; username: string; password: string }) => {
    try {
      set.setLoading(true);
      const { data } = await api.post<User>("jwt/create/", credentials);
      set.setAuth(data);
      return data;
    } catch (err) {
      throw err;
    } finally {
      set.setLoading(false);
    }
  },

  logout: async () => {
    try {
      set.setLoading(true);
      await api.post("logout/");
      set.setLogout();
    } catch (err) {
      throw err;
    } finally {
      set.setLoading(false);
    }
  },

  verify: async () => {
    try {
      set.setLoading(true);
      await api.post("jwt/verify/");
    } catch {
      set.setLogout();
    } finally {
      set.setLoading(false);
    }
  },

  register: async (data: {
    fullname: string;
    email: string;
    permissions?: string[];
  }) => {
    const res = await api.post("users/", data);
    return res.data;
  },

  activate: async (data: { uid: string; token: string }) => {
    const res = await api.post("users/activation/", data);
    return res.data;
  },

  resetPassword: async (data: { store_code: string, email: string }) => {
    const res = await api.post("users/reset_password/", data);
    return res.data;
  },

  resetPasswordConfirm: async (data: {
    uid: string;
    token: string;
    new_password: string;
    re_new_password: string;
  }) => {
    const res = await api.post("users/reset_password_confirm/", data);
    return res.data;
  },

  setCurrentStoreContext: async (data: { store_id: number }) => {
    await api.post("set-store-context/", data);
  },
};
