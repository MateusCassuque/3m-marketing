import { z } from "zod";

export const INVOICE_STATUS_VALUES = ["PENDENTE", "PAGA", "VENCIDA", "CANCELADA"] as const;

export const invoiceSchema = z.object({
  projectId: z.string().min(1, "Selecione um pedido."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  status: z.enum(INVOICE_STATUS_VALUES),
  issueDate: z.string().min(1, "Informe a data de emissão."),
  dueDate: z.string().min(1, "Informe a data de vencimento."),
  paymentMethod: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type InvoiceValues = z.infer<typeof invoiceSchema>;
