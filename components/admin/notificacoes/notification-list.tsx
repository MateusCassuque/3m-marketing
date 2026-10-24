"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

import { NOTIFICATIONS_CHANGED } from "@/components/admin/notificacoes/notification-bell";
import { NotificationRow } from "@/components/admin/notificacoes/notification-row";
import { Button } from "@/components/ui/button";
import type { AppNotification, NotificationType } from "@/lib/notification-types";

const GROUPS: { type: NotificationType; title: string; empty: string }[] = [
  { type: "invoice-overdue", title: "Cobranças por fazer", empty: "Nenhuma factura vencida." },
  { type: "project-late", title: "Pedidos atrasados", empty: "Nenhum pedido atrasado." },
  { type: "invoice-pending", title: "Facturas pendentes", empty: "Nenhuma factura pendente." },
];

export function NotificationList({ initial }: { initial: AppNotification[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);

  const mark = async (body: { keys: string[] } | { all: true }) => {
    const keys = "all" in body ? null : new Set(body.keys);
    setItems((current) => current.map((i) => (keys === null || keys.has(i.key) ? { ...i, read: true } : i)));
    try {
      await fetch("/api/admin/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    } catch {
      /* a próxima actualização repõe o estado real */
    }
  };

  const select = (item: AppNotification) => {
    if (!item.read) void mark({ keys: [item.key] });
    router.push(item.href);
  };

  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-4 shadow-soft">
        <p className="text-sm text-navy-600">
          <strong className="text-navy-700">{unread}</strong> por ler · {items.length} no total
        </p>
        <Button variant="outline" size="sm" disabled={unread === 0} onClick={() => void mark({ all: true })}>
          <CheckCheck className="h-4 w-4" />
          Marcar tudo como lido
        </Button>
      </div>

      {GROUPS.map((group) => {
        const list = items.filter((i) => i.type === group.type);
        return (
          <section key={group.type} className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
            <h2 className="flex items-center justify-between border-b border-border px-5 py-4 font-display text-base font-bold text-navy-700">
              {group.title}
              <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-500">{list.length}</span>
            </h2>
            {list.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">{group.empty}</p>
            ) : (
              <div className="divide-y divide-border/60">
                {list.map((item) => (
                  <NotificationRow key={item.key} item={item} onSelect={select} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
