import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "navy" | "accent" | "success" | "danger";

const TONES: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-600",
  navy: "bg-navy-50 text-navy-600",
  accent: "bg-accent-50 text-accent-600",
  success: "bg-emerald-50 text-emerald-600",
  danger: "bg-red-50 text-red-600",
};

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  /** Variação face ao período anterior, em %. `null` = sem base de comparação. */
  delta?: number | null;
  tone?: Tone;
}

export function KpiCard({ icon: Icon, label, value, hint, delta, tone = "primary" }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", TONES[tone])}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold",
              delta > 0 && "bg-emerald-50 text-emerald-700",
              delta < 0 && "bg-red-50 text-red-600",
              delta === 0 && "bg-navy-50 text-navy-500",
            )}
          >
            {delta > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : delta < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-navy-700 sm:text-[1.7rem]">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
