"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, CircleDashed, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRealtimeDiag, patchBadgeDiag, getRealtimeDiag } from "@/lib/realtime-client-state";
import { cn } from "@/lib/utils";

type Tone = "ok" | "error" | "wait";

function Row({ tone, label, detail }: { tone: Tone; label: string; detail?: string }) {
  const Icon = tone === "ok" ? CheckCircle2 : tone === "error" ? CircleAlert : CircleDashed;
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          tone === "ok" && "text-emerald-500",
          tone === "error" && "text-red-500",
          tone === "wait" && "text-navy-300",
        )}
      />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-navy-700">{label}</p>
        {detail && <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{detail}</p>}
      </div>
    </li>
  );
}

/** Painel de diagnóstico: mostra porque é que o tempo real ou o emblema do ícone podem não estar a funcionar. */
export function RealtimeStatus() {
  const diag = useRealtimeDiag();
  const [serverMissing, setServerMissing] = useState<string[] | null>(null);
  const [standalone, setStandalone] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<string>("—");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
    setPermission("Notification" in window ? Notification.permission : "não suportado");
    fetch("/api/admin/realtime", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { missing?: string[] }) => setServerMissing(d.missing ?? []))
      .catch(() => setServerMissing(null));
  }, []);

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    const before = getRealtimeDiag().lastEventAt;
    const started = performance.now();
    try {
      const res = (await (await fetch("/api/admin/realtime", { method: "POST" })).json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setTestResult(`O servidor não conseguiu enviar o evento: ${res.error ?? "erro desconhecido"}`);
        return;
      }
      // Espera até 6 s pelo evento de volta, através do Pusher.
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 250));
        if (getRealtimeDiag().lastEventAt !== before) {
          setTestResult(`✓ Evento recebido em ${Math.round(performance.now() - started)} ms. O tempo real está a funcionar.`);
          return;
        }
      }
      setTestResult(
        "O servidor enviou o evento, mas este browser não o recebeu. Verifique as linhas acima (canais) e se a chave e o cluster do browser são os da mesma app Pusher do servidor.",
      );
    } catch {
      setTestResult("Não foi possível contactar o servidor.");
    } finally {
      setTesting(false);
    }
  };

  const channelTone = (s: "idle" | "ok" | "error"): Tone => (s === "ok" ? "ok" : s === "error" ? "error" : "wait");
  const connTone: Tone = diag.connection === "connected" ? "ok" : ["unavailable", "failed", "disconnected"].includes(diag.connection) ? "error" : "wait";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
      <h2 className="border-b border-border px-5 py-4 font-display text-base font-bold text-navy-700">
        Diagnóstico do tempo real e do emblema
      </h2>

      <div className="grid gap-x-8 divide-y divide-border px-5 lg:grid-cols-2 lg:divide-y-0">
        <ul className="divide-y divide-border/60 py-1">
          <li className="pt-3 text-xs font-semibold text-navy-400">Tempo real (Pusher)</li>
          <Row
            tone={serverMissing === null ? "wait" : serverMissing.length === 0 ? "ok" : "error"}
            label="Variáveis no servidor"
            detail={
              serverMissing === null
                ? "A verificar…"
                : serverMissing.length === 0
                  ? "Todas definidas."
                  : `Em falta: ${serverMissing.join(", ")}. Defina-as no ambiente e volte a publicar.`
            }
          />
          <Row
            tone={diag.keyPresent ? "ok" : "error"}
            label="Chave e cluster no browser"
            detail={
              diag.keyPresent
                ? undefined
                : "NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER não chegaram ao browser. Estas variáveis só entram no build: defina-as e faça um novo deploy."
            }
          />
          <Row tone={connTone} label="Ligação ao Pusher" detail={`Estado: ${diag.connection}`} />
          <Row tone={channelTone(diag.shared)} label="Canal partilhado (facturas e pedidos)" detail={diag.sharedError} />
          <Row tone={channelTone(diag.mine)} label="Canal pessoal (lido noutros dispositivos)" detail={diag.mineError} />
          <li className="py-3">
            <Button size="sm" variant="primary" onClick={sendTest} disabled={testing}>
              {testing && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar evento de teste
            </Button>
            {testResult && <p className="mt-2.5 text-[13px] leading-snug text-navy-600">{testResult}</p>}
          </li>
        </ul>

        <ul className="divide-y divide-border/60 py-1">
          <li className="pt-3 text-xs font-semibold text-navy-400">Emblema no ícone da app</li>
          <Row
            tone={diag.badge.supported ? "ok" : "error"}
            label="Este browser suporta emblemas"
            detail={diag.badge.supported ? undefined : "A Badging API não existe aqui (ex.: Firefox, ou Chrome/Safari antigos)."}
          />
          <Row
            tone={standalone === null ? "wait" : standalone ? "ok" : "error"}
            label="Está a usar a app instalada"
            detail={
              standalone === false
                ? "Está num separador do browser. O emblema do ícone só aparece quando abre o painel pela app instalada."
                : undefined
            }
          />
          <Row
            tone={permission === "granted" ? "ok" : "wait"}
            label={`Permissão de notificações: ${permission === "granted" ? "concedida" : permission === "denied" ? "bloqueada" : permission === "default" ? "por pedir" : permission}`}
            detail={
              permission === "granted"
                ? undefined
                : "Em alguns sistemas (Android, iOS) o emblema só aparece com esta permissão. Use o botão Activar do sino."
            }
          />
          <Row
            tone={diag.badge.lastResult === "ok" ? "ok" : diag.badge.lastResult === "error" ? "error" : "wait"}
            label={
              diag.badge.lastResult === "ok"
                ? `Último pedido ao sistema: emblema ${diag.badge.lastCount ? diag.badge.lastCount : "limpo"} aceite`
                : diag.badge.lastResult === "error"
                  ? "O sistema recusou o emblema"
                  : "Ainda sem pedido ao sistema"
            }
            detail={diag.badge.error}
          />
          <li className="space-y-2 py-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void> };
                  nav.setAppBadge?.(7)
                    ?.then(() => patchBadgeDiag({ lastResult: "ok", lastCount: 7, error: undefined }))
                    .catch((e: unknown) => patchBadgeDiag({ lastResult: "error", error: e instanceof Error ? e.message : String(e) }));
                }}
              >
                Testar emblema (7)
              </Button>
            </div>
            <p className="text-[13px] leading-snug text-muted-foreground">
              No Android o sistema costuma mostrar só um ponto, não o número, e depende do lançador. No Windows, macOS e iOS aparece o
              número. Com a app fechada o emblema não se actualiza: seria preciso Web Push.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
