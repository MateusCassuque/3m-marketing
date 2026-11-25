import { z } from "zod";

/**
 * Detalhes específicos de alguns serviços (visto, passaporte, bilhetes).
 * Guardados em `Project.serviceDetails` (JSON).
 */

export const DETAIL_SERVICES = ["ASSESSORIA_VISTO", "ASSESSORIA_PASSAPORTE", "BILHETES"] as const;
export type DetailService = (typeof DETAIL_SERVICES)[number];

export function hasServiceDetails(service: string): service is DetailService {
  return (DETAIL_SERVICES as readonly string[]).includes(service);
}

export const VISA_TYPES = [
  { value: "TURISMO", label: "Turismo" },
  { value: "NEGOCIOS", label: "Negócios" },
  { value: "TRABALHO", label: "Trabalho" },
  { value: "ESTUDO", label: "Estudo" },
  { value: "TRANSITO", label: "Trânsito" },
  { value: "RESIDENCIA", label: "Residência" },
  { value: "OUTRO", label: "Outro" },
] as const;

export const PASSPORT_KINDS = [
  { value: "PRIMEIRA_EMISSAO", label: "Primeira emissão" },
  { value: "RENOVACAO", label: "Renovação" },
  { value: "SEGUNDA_VIA", label: "Segunda via (perda ou dano)" },
] as const;

export const applicantSchema = z.object({
  name: z.string().trim().max(120),
  passportNumber: z.string().trim().max(30),
});

export const serviceDetailsSchema = z.object({
  /** true = o serviço é para o próprio cliente do pedido; false = para outras pessoas. */
  forClient: z.boolean(),
  applicants: z.array(applicantSchema).max(20),
  country: z.string().trim().max(80),
  visaType: z.string().max(30),
  passportKind: z.string().max(30),
  origin: z.string().trim().max(80),
  destination: z.string().trim().max(80),
  departDate: z.string(),
  returnDate: z.string(),
  /** Preço de cada requerente/passageiro (o valor do pedido = preço × nº de pessoas). */
  unitValue: z.number().optional(),
});

export type ServiceDetails = z.infer<typeof serviceDetailsSchema>;
export type Applicant = z.infer<typeof applicantSchema>;

export const EMPTY_DETAILS: ServiceDetails = {
  forClient: true,
  applicants: [{ name: "", passportNumber: "" }],
  country: "",
  visaType: "TURISMO",
  passportKind: "PRIMEIRA_EMISSAO",
  origin: "",
  destination: "",
  departDate: "",
  returnDate: "",
};

/** Lê o JSON guardado na base de dados de forma segura (devolve null se estiver vazio ou inválido). */
export function parseServiceDetails(value: unknown): ServiceDetails | null {
  if (!value || typeof value !== "object") return null;
  const parsed = serviceDetailsSchema.partial().safeParse(value);
  if (!parsed.success) return null;
  return { ...EMPTY_DETAILS, ...parsed.data, applicants: parsed.data.applicants ?? [] };
}

export const visaTypeLabel = (v: string) => VISA_TYPES.find((t) => t.value === v)?.label ?? v;
export const passportKindLabel = (v: string) => PASSPORT_KINDS.find((t) => t.value === v)?.label ?? v;

export const APPLICANT_NOUN: Record<DetailService, { one: string; many: string }> = {
  ASSESSORIA_VISTO: { one: "requerente", many: "requerentes" },
  ASSESSORIA_PASSAPORTE: { one: "requerente", many: "requerentes" },
  BILHETES: { one: "passageiro", many: "passageiros" },
};
