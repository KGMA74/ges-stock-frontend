import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerTransactionSchema } from "@/lib/validations/registerTransactionSchema";

// Déduire automatiquement le type depuis le schéma Zod
type registerTransactionFormData = z.infer<typeof registerTransactionSchema>;

export function useRegisterTransactionForm() {
  return useForm<registerTransactionFormData>({
    resolver: zodResolver(registerTransactionSchema),
    mode: "onChange",
  });
}
