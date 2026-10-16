import type { ServiceInterest, LeadStatus } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";

export const SERVICE_LABELS: Record<ServiceInterest, string> = {
  WEBSITE: "Website institucional",
  WEBAPP: "Aplicação web + painel",
  LANDING_PAGE: "Landing page",
  MIDIAS_SOCIAIS: "Redes sociais (3M)",
  IDENTIDADE_VISUAL: "Identidade visual",
  REGISTO_EMPRESA: "Registo de empresa",
  // Valores antigos, mantidos para não perder o histórico de leads.
  ESTRATEGIA: "Estratégia",
  CRIATIVIDADE: "Criatividade",
  TRAFEGO: "Gestão de tráfego",
  BRANDING: "Branding",
  OUTRO: "Outro",
};

/** Serviços oferecidos hoje (os valores antigos não aparecem nos formulários do painel). */
export const ACTIVE_SERVICES: ServiceInterest[] = [
  "WEBSITE",
  "WEBAPP",
  "LANDING_PAGE",
  "MIDIAS_SOCIAIS",
  "IDENTIDADE_VISUAL",
  "REGISTO_EMPRESA",
  "OUTRO",
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novo",
  EM_CONTATO: "Em contacto",
  QUALIFICADO: "Qualificado",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};

export const STATUS_ORDER: LeadStatus[] = ["NOVO", "EM_CONTATO", "QUALIFICADO", "GANHO", "PERDIDO"];

export const STATUS_BADGE_VARIANT: Record<LeadStatus, NonNullable<BadgeProps["variant"]>> = {
  NOVO: "default",
  EM_CONTATO: "accent",
  QUALIFICADO: "navy",
  GANHO: "success",
  PERDIDO: "destructive",
};
