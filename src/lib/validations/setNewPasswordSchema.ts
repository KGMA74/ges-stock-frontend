import { z } from "zod";

export const setNewPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8),
  re_new_password: z
    .string()
}).refine((data) => data.new_password === data.re_new_password, {
    path: ['re_new_password'],
    message: 'Les mots de passe ne correspondent pas'
});

