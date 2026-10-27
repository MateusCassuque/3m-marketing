"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BellRing, CheckCheck } from "lucide-react";

import { NotificationRow } from "@/components/admin/notificacoes/notification-row";
import type { AppNotification, NotificationsPayload } from "@/lib/notification-types";
import { cn } from "@/lib/utils";

const POLL_MS = 60_000;
/** Com o tempo real ligado, a consulta periódica serve só de rede de segurança (ex.: viragem do dia). */
const POLL_LIVE_MS = 300_000;
const STORAGE_KEY = "kodeza:notified";
export const NOTIFICATIONS_CHANGED = "kodeza:notifications-changed";

type Permission = NotificationPermission | "unsupported";

function readNotified(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function saveNotified(keys: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(keys).slice(-500)));
  } catch {
    /* sem armazenamento: continua a funcionar, só pode repetir alertas */
  }
}

/** Mostra uma notificação do sistema (barra de tarefas / centro de notificações). */
async function showSystemNotification(title: string, body: string, url: string, tag: string) {
  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag,
    data: { url },
  };

  try {
    const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      window.location.href = url;
    };
  } catch (error) {
    console.error("[notificações] não foi possível mostrar o alerta", error);
  }
}

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<NotificationsPayload>({ items: [], unread: 0 });
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [permission, setPermission] = useState<Permission>("default");
  const [live, setLive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const permissionRef = useRef<Permission>("default");

  const notifyNew = useCallback(async (payload: NotificationsPayload) => {
    if (permissionRef.current !== "granted") return;

    const notified = readNotified();
    const fresh = payload.items.filter((i) => !i.read && !notified.has(i.key));
    if (fresh.length === 0) return;

    if (fresh.length > 3) {
      await showSystemNotification(
        `Tem ${fresh.length} notificações novas`,
        "Facturas por cobrar e pedidos atrasados precisam da sua atenção.",
        "/admin/notificacoes",
        "kodeza-resumo",
      );
    } else {
      for (const item of fresh) {
        await showSystemNotification(item.title, item.body, item.href, item.key);
      }
    }

    fresh.forEach((i) => notified.add(i.key));
    saveNotified(notified);
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as NotificationsPayload;
      setData(payload);
      setLoaded(true);
      void notifyNew(payload);
    } catch {
      /* sem rede: tenta outra vez no próximo ciclo */
    }
  }, [notifyNew]);

  const post = useCallback(async (body: { keys: string[] } | { all: true }) => {
    // Actualização optimista, como no Facebook: o ponto azul desaparece logo.
    setData((current) => {
      const keys = "all" in body ? null : new Set(body.keys);
      const items = current.items.map((i) => (keys === null || keys.has(i.key) ? { ...i, read: true } : i));
      return { items, unread: items.filter((i) => !i.read).length };
    });
    try {
      const response = await fetch("/api/admin/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) setData((await response.json()) as NotificationsPayload);
    } catch {
      void load();
    }
  }, [load]);

  // Registo do service worker, permissão e primeira carga.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const current: Permission = "Notification" in window ? Notification.permission : "unsupported";
    permissionRef.current = current;
    setPermission(current);
    void load();
  }, [load]);

  // Actualização periódica, ao voltar ao separador e quando outra parte do painel mexe nas notificações.
  useEffect(() => {
    const interval = window.setInterval(() => void load(), live ? POLL_LIVE_MS : POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void load();
    };
    const onChanged = () => void load();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener(NOTIFICATIONS_CHANGED, onChanged);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener(NOTIFICATIONS_CHANGED, onChanged);
    };
  }, [load, live]);

  // Tempo real (Pusher): o servidor avisa quando facturas/pedidos mudam ou quando
  // este utilizador marca algo como lido noutro dispositivo. O evento não leva dados:
  // só despoleta uma nova consulta autenticada.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster || !userId) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      try {
        const { default: Pusher } = await import("pusher-js");
        if (cancelled) return;

        const client = new Pusher(key, {
          cluster,
          channelAuthorization: { endpoint: "/api/pusher/auth", transport: "ajax" },
        });

        let timer: ReturnType<typeof setTimeout> | undefined;
        const refresh = () => {
          clearTimeout(timer);
          timer = setTimeout(() => void load(), 250); // junta rajadas de eventos numa só consulta
        };

        const shared = client.subscribe("private-admins");
        const mine = client.subscribe(`private-user-${userId}`);
        shared.bind("notifications:changed", refresh);
        mine.bind("notifications:changed", refresh);

        client.connection.bind("state_change", (state: { current: string }) => {
          const connected = state.current === "connected";
          setLive(connected);
          if (connected) refresh();
        });

        cleanup = () => {
          clearTimeout(timer);
          client.unsubscribe("private-admins");
          client.unsubscribe(`private-user-${userId}`);
          client.disconnect();
          setLive(false);
        };
      } catch (error) {
        console.error("[tempo real] não foi possível ligar", error);
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [userId, load]);

  // Contador no título do separador "(3) Dashboard…" e no ícone da app instalada.
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(/^\(\d+\)\s*/, "");
      document.title = data.unread > 0 ? `(${data.unread}) ${base}` : base;
    };
    apply();
    const timer = window.setTimeout(apply, 400); // depois de o Next actualizar o título
    const nav = navigator as Navigator & {
      setAppBadge?: (n?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (data.unread > 0) nav.setAppBadge?.(data.unread)?.catch(() => undefined);
    else nav.clearAppBadge?.()?.catch(() => undefined);
    return () => window.clearTimeout(timer);
  }, [data.unread, pathname]);

  // Fechar ao clicar fora, com Escape ou ao mudar de página.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const enableSystemAlerts = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    setPermission(result);
    if (result === "granted") {
      // Não despeja tudo de uma vez: o que já existe conta como "visto".
      const notified = readNotified();
      data.items.forEach((i) => notified.add(i.key));
      saveNotified(notified);
      await showSystemNotification(
        "Notificações activadas",
        data.unread > 0
          ? `Tem ${data.unread} por tratar. Vamos avisá-lo das novas.`
          : "Vamos avisá-lo sobre facturas e pedidos em atraso.",
        "/admin/notificacoes",
        "kodeza-activadas",
      );
    }
  };

  const select = (item: AppNotification) => {
    if (!item.read) void post({ keys: [item.key] });
    setOpen(false);
    router.push(item.href);
  };

  const visible = tab === "unread" ? data.items.filter((i) => !i.read) : data.items;
  const badge = data.unread > 99 ? "99+" : String(data.unread);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={data.unread > 0 ? `Notificações (${data.unread} por ler)` : "Notificações"}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-full transition-colors",
          open ? "bg-primary-100 text-primary-700" : "bg-white text-navy-600 shadow-soft hover:bg-navy-50",
        )}
      >
        {data.unread > 0 ? <BellRing className="h-5 w-5" strokeWidth={1.8} /> : <Bell className="h-5 w-5" strokeWidth={1.8} />}
        {data.unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-[#F3F6FB]">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificações"
          className="fixed inset-x-3 top-[68px] z-50 overflow-hidden rounded-2xl border border-border bg-white shadow-card md:absolute md:inset-x-auto md:right-0 md:top-[52px] md:w-[420px]"
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <div>
              <h2 className="font-display text-lg font-bold text-navy-700">Notificações</h2>
              {live && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Em tempo real
                </p>
              )}
            </div>
            {data.unread > 0 && (
              <button
                type="button"
                onClick={() => void post({ all: true })}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar tudo como lido
              </button>
            )}
          </div>

          <div className="flex gap-2 px-4 pb-3" role="tablist">
            {(
              [
                ["all", "Todas"],
                ["unread", `Não lidas${data.unread ? ` (${data.unread})` : ""}`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  tab === value ? "bg-primary-100 text-primary-700" : "text-navy-500 hover:bg-navy-50",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {permission === "default" && (
            <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-xl bg-navy-800 px-3.5 py-3 text-white">
              <p className="text-[13px] leading-snug text-white/85">
                Receba alertas no ecrã mesmo com o painel noutro separador.
              </p>
              <button
                type="button"
                onClick={() => void enableSystemAlerts()}
                className="shrink-0 rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-semibold hover:bg-accent-600"
              >
                Activar
              </button>
            </div>
          )}
          {permission === "denied" && (
            <p className="mx-4 mb-3 rounded-xl bg-navy-50 px-3.5 py-2.5 text-xs text-navy-500">
              Os alertas no ecrã estão bloqueados neste browser. Pode permiti-los nas definições do site.
            </p>
          )}

          <div className="max-h-[min(60vh,440px)] overflow-y-auto border-t border-border">
            {!loaded ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">A carregar…</p>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCheck className="h-6 w-6" />
                </span>
                <p className="mt-3 font-semibold text-navy-700">
                  {tab === "unread" ? "Não há nada por ler" : "Está tudo em dia"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sem facturas por cobrar nem pedidos atrasados.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {visible.slice(0, 15).map((item) => (
                  <NotificationRow key={item.key} item={item} onSelect={select} />
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/notificacoes"
            className="block border-t border-border py-3 text-center text-sm font-semibold text-primary-700 hover:bg-primary-50"
          >
            Ver todas as notificações
          </Link>
        </div>
      )}
    </div>
  );
}
