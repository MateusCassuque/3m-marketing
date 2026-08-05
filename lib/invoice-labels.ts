import type { InvoiceStatus } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
};

export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, NonNullable<BadgeProps["variant"]>> = {
  PENDENTE: "default",
  PAGA: "success",
  VENCIDA: "destructive",
  CANCELADA: "outline",
};
