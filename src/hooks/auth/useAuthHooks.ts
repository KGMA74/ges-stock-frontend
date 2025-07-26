import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService"; // ton ancien service
import { User } from "@/lib/types";

export const useRetrieveUser = () => {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: authService.retrieveUser,
    retry: false,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: authService.logout,
  });
};

export const useVerify = () => {
  return useMutation({
    mutationFn: authService.verify,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};

export const useResetPasswordConfirm = () => {
  return useMutation({
    mutationFn: authService.resetPasswordConfirm,
  });
};

export const useSetCurrentStoreContext = () => {
  return useMutation({
    mutationFn: authService.setCurrentStoreContext,
  });
};
