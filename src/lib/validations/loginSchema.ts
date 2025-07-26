import { z } from "zod";

export const loginSchema = z.object({
  store_name: z
    .string().min(1, "Ce champ est requis"),

  username: z
    .string()
    .min(1, "L’identifiant est requis"),
  password: z
    .string()
});
