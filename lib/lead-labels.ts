import type { ServiceInterest, LeadStatus } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";

export const SERVICE_LABELS: Record<ServiceInterest, string> = {
  ESTRATEGIA: "Estratégia",
  CRIATIVIDADE: "Criatividade",
  TRAFEGO: "Gestão de Tráfego",
  MIDIAS_SOCIAIS: "Mídias Sociais",
  BRANDING: "Branding",
  OUTRO: "Outro",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novo",
  EM_CONTATO: "Em contato",
  QUALIFICADO: "Qualificado",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};

export const STATUS_BADGE_VARIANT: Record<LeadStatus, NonNullable<BadgeProps["variant"]>> = {
  NOVO: "default",
  EM_CONTATO: "accent",
  QUALIFICADO: "navy",
  GANHO: "success",
  PERDIDO: "destructive",
};
