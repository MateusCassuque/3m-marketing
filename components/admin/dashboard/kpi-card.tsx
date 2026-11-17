import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  /** Variação face ao período anterior, em %. `null` = sem base de comparação. */
  delta?: number | null;
  /** Realce discreto: um filete colorido à esquerda. */
  accent?: "primary" | "accent" | "success" | "danger";
}

const ACCENT = {
  primary: "bg-primary-500",
  accent: "bg-accent-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
};

/** Cartão de indicador, minimalista: rótulo discreto, número grande e uma linha de contexto. */
export function KpiCard({ icon: Icon, label, value, hint, delta, accent = "primary" }: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(4,19,46,0.05),0_8px_24px_-12px_rgba(4,19,46,0.08)] ring-1 ring-navy-900/[0.04]">
      <span className={cn("absolute inset-y-5 left-0 w-[3px] rounded-r-full", ACCENT[accent])} aria-hidden="true" />
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-navy-300" strokeWidth={1.8} />
      </div>

      <p className="mt-3 font-display text-[1.75rem] font-bold leading-none tracking-tight text-navy-700">{value}</p>

      <div className="mt-3 flex min-h-5 items-center gap-2 text-xs">
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold",
              delta > 0 && "text-emerald-600",
              delta < 0 && "text-red-600",
              delta === 0 && "text-navy-400",
            )}
          >
            {delta > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : delta < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
