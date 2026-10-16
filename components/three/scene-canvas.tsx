"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Mounter = (container: HTMLElement, options: { onReady?: () => void }) => () => void;

interface SceneCanvasProps {
  /** Carrega o módulo three.js só no browser (code-splitting). */
  load: () => Promise<Mounter>;
  className?: string;
  /** Mostrado enquanto a cena carrega ou se o WebGL não estiver disponível. */
  fallback?: ReactNode;
  label?: string;
}

/**
 * Contentor genérico para cenas three.js. Faz o carregamento tardio, trata
 * da limpeza e mostra o `fallback` se o dispositivo não suportar WebGL.
 */
export function SceneCanvas({ load, className, fallback, label }: SceneCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const supportsWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
      } catch {
        return false;
      }
    };

    if (!supportsWebGL()) {
      setFailed(true);
      return;
    }

    const run = async () => {
      try {
        const mount = await load();
        if (disposed || !ref.current) return;
        cleanup = mount(ref.current, { onReady: () => !disposed && setReady(true) });
      } catch (error) {
        console.error("[3D] não foi possível iniciar a cena", error);
        if (!disposed) setFailed(true);
      }
    };

    // Dá prioridade ao conteúdo: inicia a cena quando o browser está livre.
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(run, { timeout: 1200 });
    else timeoutId = setTimeout(run, 150);

    return () => {
      disposed = true;
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative", className)} role="img" aria-label={label}>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          ready && !failed ? "opacity-0" : "opacity-100",
        )}
        aria-hidden="true"
      >
        {fallback}
      </div>
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          ready && !failed ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
