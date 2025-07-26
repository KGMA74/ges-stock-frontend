import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.email(),
  phone_number: z.string().min(8).max(15),
  fullname: z.string().min(1, "ce champ est requis"),

//   is_superuser: z.boolean().optional().default(false),
//   is_active: z.boolean().optional().default(true),

  permissions: z.array(z.string()).optional(), // Liste de slugs ou IDs de permissions
});
