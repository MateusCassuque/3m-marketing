import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente.").max(120),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
  phone: z.string().trim().min(6, "Informe o número de telefone.").max(25),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  taxId: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ClientValues = z.infer<typeof clientSchema>;
