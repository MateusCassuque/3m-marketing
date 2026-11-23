"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RANGE_PRESETS, type RangeKey } from "@/lib/date-range";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  /** Período em uso (vem do servidor, de `resolveRange`). */
  current: { key: RangeKey; label: string; de: string; ate: string };
  className?: string;
}

/**
 * Filtro de período: atalhos (hoje, semana, mês, últimos N dias, ano) e calendário personalizado.
 * Mantém os outros filtros do URL (pesquisa, estado…) e volta à página 1.
 */
export function DateRangeFilter({ current, className }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [de, setDe] = useState(current.de);
  const [ate, setAte] = useState(current.ate);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDe(current.de);
    setAte(current.ate);
  }, [current.de, current.ate]);

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

  const go = (values: { periodo: string; de?: string; ate?: string }) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("page");
    next.delete("de");
    next.delete("ate");
    next.set("periodo", values.periodo);
    if (values.de) next.set("de", values.de);
    if (values.ate) next.set("ate", values.ate);
    setOpen(false);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3.5 text-sm font-semibold text-navy-700 shadow-soft transition-colors hover:bg-navy-50"
      >
        <CalendarDays className="h-4 w-4 text-primary-600" />
        <span className="max-w-[200px] truncate">{current.label}</span>
        <ChevronDown className={cn("h-4 w-4 text-navy-300 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] z-40 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <ul className="max-h-72 overflow-y-auto p-1.5">
            {RANGE_PRESETS.map((preset) => (
              <li key={preset.key}>
                <button
                  type="button"
                  onClick={() => go({ periodo: preset.key })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-navy-50",
                    current.key === preset.key ? "font-semibold text-primary-700" : "text-navy-600",
                  )}
                >
                  {preset.label}
                  {current.key === preset.key && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-border bg-navy-50/50 p-3.5">
            <p className="text-xs font-semibold text-navy-500">Escolher no calendário</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-xs text-muted-foreground">
                De
                <input
                  type="date"
                  value={de}
                  max={ate || undefined}
                  onChange={(e) => setDe(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-2 text-sm text-navy-700"
                />
              </label>
              <label className="space-y-1 text-xs text-muted-foreground">
                Até
                <input
                  type="date"
                  value={ate}
                  min={de || undefined}
                  onChange={(e) => setAte(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-white px-2 text-sm text-navy-700"
                />
              </label>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="w-full"
              disabled={!de && !ate}
              onClick={() => go({ periodo: "custom", de, ate })}
            >
              Aplicar período
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
