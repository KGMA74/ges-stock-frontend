import { z } from "zod";

export const registerTransactionSchema = z.object({
  fullname: z.string().min(1, "ce champ est requis"),
  motif: z.string(),
  amount: z.string().refine(val => !isNaN(Number(val)), {
    message: 'montant non valide',
  }).refine(val => Number(val) >= 100, {
    message: 'le montant doit etre superieur a 100f',
  }),
  phone_number: z.string().min(8).max(15),
});
