import { z } from "zod";

import { hasServiceDetails, serviceDetailsSchema } from "@/lib/service-details";

export const PROJECT_STATUS_VALUES = [
  "BACKLOG",
  "EM_ANDAMENTO",
  "EM_REVISAO",
  "CONCLUIDO",
  "CANCELADO",
] as const;

export const PRIORITY_VALUES = ["BAIXA", "MEDIA", "ALTA", "URGENTE"] as const;

export const SERVICE_VALUES = [
  "WEBSITE",
  "WEBAPP",
  "LANDING_PAGE",
  "MIDIAS_SOCIAIS",
  "IDENTIDADE_VISUAL",
  "REGISTO_EMPRESA",
  "OUTRO",
  // Valores antigos — mantidos para pedidos já existentes.
  "ESTRATEGIA",
  "CRIATIVIDADE",
  "TRAFEGO",
  "BRANDING",
  // Novos serviços (com campos próprios — ver lib/service-details.ts).
  "ASSESSORIA_VISTO",
  "BILHETES",
  "ASSESSORIA_PASSAPORTE",
] as const;

export const BILLING_VALUES = ["UNICO", "RECORRENTE"] as const;
export const RECURRENCE_OPTIONS = [
  { value: 1, label: "Todos os meses" },
  { value: 3, label: "A cada 3 meses" },
  { value: 6, label: "A cada 6 meses" },
  { value: 12, label: "Todos os anos" },
] as const;

export const projectSchema = z
  .object({
    title: z.string().trim().min(2, "Informe o título do pedido.").max(160),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    clientId: z.string().min(1, "Selecione um cliente."),
    service: z.enum(SERVICE_VALUES),
    status: z.enum(PROJECT_STATUS_VALUES),
    priority: z.enum(PRIORITY_VALUES),
    /** Valor do pedido — ou, nos recorrentes, o valor de cada cobrança. */
    value: z.coerce.number().min(0, "O valor não pode ser negativo."),
    startDate: z.string().optional().or(z.literal("")),
    dueDate: z.string().optional().or(z.literal("")),

    // Cobrança
    billingType: z.enum(BILLING_VALUES),
    recurrenceMonths: z.coerce.number().int().refine((v) => [1, 3, 6, 12].includes(v), "Periodicidade inválida."),
    nextBillingDate: z.string().optional().or(z.literal("")),
    recurrenceEndDate: z.string().optional().or(z.literal("")),
    paymentTermDays: z.coerce.number().int().min(0, "Mínimo 0.").max(120, "Máximo 120 dias."),

    // Visto, passaporte, bilhetes
    serviceDetails: serviceDetailsSchema,
  })
  .superRefine((data, ctx) => {
    if (data.billingType === "RECORRENTE" && data.value <= 0) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Indique o valor de cada cobrança." });
    }

    if (!hasServiceDetails(data.service)) return;
    const d = data.serviceDetails;
    const required = (field: keyof typeof d, message: string) => {
      if (!String(d[field] ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["serviceDetails", field], message });
      }
    };

    if (data.service === "ASSESSORIA_VISTO") required("country", "Indique o país de destino.");
    if (data.service === "BILHETES") {
      required("origin", "Indique a origem.");
      required("destination", "Indique o destino.");
      required("departDate", "Indique a data de ida.");
    }

    // Com "outras pessoas", cada pessoa precisa de nome (o nome do cliente é preenchido automaticamente).
    if (!d.forClient) {
      if (d.applicants.length === 0) {
        ctx.addIssue({ code: "custom", path: ["serviceDetails", "applicants"], message: "Adicione pelo menos uma pessoa." });
      }
      d.applicants.forEach((person, index) => {
        if (person.name.trim().length < 2) {
          ctx.addIssue({
            code: "custom",
            path: ["serviceDetails", "applicants", index, "name"],
            message: "Indique o nome.",
          });
        }
      });
    }
  });

export type ProjectValues = z.infer<typeof projectSchema>;
