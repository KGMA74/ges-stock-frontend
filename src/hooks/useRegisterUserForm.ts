import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema } from "@/lib/validations/RegisterUserSchema";
import { useForm } from "react-hook-form";

// Déduire automatiquement le type depuis le schéma Zod
type registerUserFormData = z.infer<typeof registerUserSchema>;

export function useRegisterUserForm() {
  return useForm<registerUserFormData>({
    resolver: zodResolver(registerUserSchema),
    mode: "onBlur",
    defaultValues: {
        permissions: []
    }
  });
}
