import {
  hasServiceDetails,
  passportKindLabel,
  visaTypeLabel,
  type ServiceDetails,
} from "@/lib/service-details";

export interface InvoiceLine {
  /** Nome do pedido (usado quando o serviço é para o próprio cliente). */
  title: string;
  /** Requerentes / passageiros, quando o pedido NÃO é para o cliente. Vazio = usa o título. */
  names: string[];
  /** Descrição curta do serviço, ex.: "Assessoria de visto · Turismo · Portugal". */
  subtitle: string | null;
  /** Quantidade facturada: nº de requerentes (ou 1). */
  quantity: number;
}

const SERVICE_NAME: Record<string, string> = {
  ASSESSORIA_VISTO: "Assessoria de visto",
  ASSESSORIA_PASSAPORTE: "Assessoria de passaporte",
  BILHETES: "Bilhete de passagem",
};

/**
 * O que aparece na linha do produto da factura:
 *  - pedido para o próprio cliente → nome do pedido, quantidade 1 (como sempre);
 *  - pedido para outras pessoas (visto, passaporte, bilhetes) → o nome de cada requerente/passageiro,
 *    e a quantidade é o número de pessoas.
 */
export function buildInvoiceLine(project: {
  title: string;
  service: string;
  details: ServiceDetails | null;
}): InvoiceLine {
  const { title, service, details } = project;

  if (!hasServiceDetails(service) || !details || details.forClient) {
    return { title, names: [], subtitle: null, quantity: 1 };
  }

  const names = details.applicants.map((a) => a.name.trim()).filter(Boolean);
  if (names.length === 0) return { title, names: [], subtitle: null, quantity: 1 };

  const parts: string[] = [SERVICE_NAME[service]];
  if (service === "ASSESSORIA_VISTO") {
    if (details.visaType) parts.push(visaTypeLabel(details.visaType));
    if (details.country) parts.push(details.country);
  } else if (service === "ASSESSORIA_PASSAPORTE") {
    if (details.passportKind) parts.push(passportKindLabel(details.passportKind));
  } else if (service === "BILHETES") {
    if (details.origin || details.destination) parts.push(`${details.origin || "—"} → ${details.destination || "—"}`);
  }

  return { title, names, subtitle: parts.join(" · "), quantity: names.length };
}
