"use client";

import { AlertTriangle, CalendarClock, Receipt } from "lucide-react";

import type { AppNotification, NotificationType } from "@/lib/notification-types";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationType, { icon: typeof Receipt; tone: string }> = {
  "invoice-overdue": { icon: AlertTriangle, tone: "bg-red-50 text-red-600" },
  "invoice-pending": { icon: Receipt, tone: "bg-primary-50 text-primary-600" },
  "project-late": { icon: CalendarClock, tone: "bg-accent-50 text-accent-600" },
};

export function relativeDay(iso: string) {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" }).format(days, "day");
}

/** Linha de notificação, ao estilo do Facebook/YouTube: não lidas com fundo azul claro e um ponto. */
export function NotificationRow({
  item,
  onSelect,
}: {
  item: AppNotification;
  onSelect: (item: AppNotification) => void;
}) {
  const { icon: Icon, tone } = ICONS[item.type];

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-navy-50",
        !item.read && "bg-primary-50/60",
      )}
    >
      <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm leading-snug text-navy-700", !item.read && "font-semibold")}>
          {item.title}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{item.body}</span>
        <span className={cn("mt-1 block text-xs font-medium", item.read ? "text-navy-300" : "text-primary-600")}>
          {relativeDay(item.at)}
        </span>
      </span>
      {!item.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" aria-label="Não lida" />}
    </button>
  );
}
