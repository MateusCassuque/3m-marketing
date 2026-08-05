import { z } from "zod";

export const PROJECT_STATUS_VALUES = [
  "BACKLOG",
  "EM_ANDAMENTO",
  "EM_REVISAO",
  "CONCLUIDO",
  "CANCELADO",
] as const;

export const PRIORITY_VALUES = ["BAIXA", "MEDIA", "ALTA", "URGENTE"] as const;

export const SERVICE_VALUES = [
  "ESTRATEGIA",
  "CRIATIVIDADE",
  "TRAFEGO",
  "MIDIAS_SOCIAIS",
  "BRANDING",
  "OUTRO",
] as const;

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Informe o título do pedido.").max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  clientId: z.string().min(1, "Selecione um cliente."),
  service: z.enum(SERVICE_VALUES),
  status: z.enum(PROJECT_STATUS_VALUES),
  priority: z.enum(PRIORITY_VALUES),
  value: z.coerce.number().min(0, "O valor não pode ser negativo."),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export type ProjectValues = z.infer<typeof projectSchema>;
