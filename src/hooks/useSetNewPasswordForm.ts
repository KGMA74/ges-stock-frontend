import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { setNewPasswordSchema } from "@/lib/validations/setNewPasswordSchema";

type setNewPasswordFormData = z.infer<typeof setNewPasswordSchema>;

export function useSetNewPasswordForm() {
  return useForm<setNewPasswordFormData>({
    resolver: zodResolver(setNewPasswordSchema),
    mode: 'onChange'
  });
}
