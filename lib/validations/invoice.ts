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
  /** "Não falta mais nada": esta factura fecha o pedido (valor em falta = 0). */
  settlesProject: z.boolean().default(false),
  /** Onde o dinheiro entrou (só faz sentido nas facturas pagas). */
  accountId: z.string().optional().or(z.literal("")),
  /** Data em que foi recebido (por defeito, hoje). */
  paidAt: z.string().optional().or(z.literal("")),
});

export const markPaidSchema = z.object({
  accountId: z.string().optional().or(z.literal("")),
  paidAt: z.string().optional().or(z.literal("")),
});
export type MarkPaidValues = z.infer<typeof markPaidSchema>;

export type InvoiceValues = z.infer<typeof invoiceSchema>;
