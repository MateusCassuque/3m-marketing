import type { ProjectStatus, Priority } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  BACKLOG: "Backlog",
  EM_ANDAMENTO: "Em andamento",
  EM_REVISAO: "Em revisão",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, NonNullable<BadgeProps["variant"]>> = {
  BACKLOG: "outline",
  EM_ANDAMENTO: "default",
  EM_REVISAO: "accent",
  CONCLUIDO: "success",
  CANCELADO: "destructive",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const PRIORITY_BADGE: Record<Priority, NonNullable<BadgeProps["variant"]>> = {
  BAIXA: "outline",
  MEDIA: "navy",
  ALTA: "accent",
  URGENTE: "destructive",
};
