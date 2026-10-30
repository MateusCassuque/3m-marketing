"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Botão "Instalar app" no menu: a app instalada mostra o número de notificações no ícone. */
export function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setStandalone(isStandalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone) return null;

  if (promptEvent) {
    return (
      <button
        type="button"
        onClick={async () => {
          await promptEvent.prompt();
          await promptEvent.userChoice;
          setPromptEvent(null);
        }}
        className="mt-3 flex w-full items-center gap-2.5 rounded-xl bg-primary-500/20 px-3 py-2.5 text-sm font-semibold text-primary-200 transition-colors hover:bg-primary-500/30"
      >
        <Download className="h-[18px] w-[18px]" strokeWidth={1.8} />
        Instalar app do painel
      </button>
    );
  }

  if (ios) {
    return (
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs leading-snug text-white/60">
        <Share className="mt-0.5 h-4 w-4 shrink-0" />
        Para instalar: toque em Partilhar e depois em "Adicionar ao ecrã principal".
      </p>
    );
  }

  return null;
}
