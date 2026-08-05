import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente.").max(120),
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  taxId: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ClientValues = z.infer<typeof clientSchema>;
