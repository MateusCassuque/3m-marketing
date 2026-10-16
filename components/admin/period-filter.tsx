import Link from "next/link";

import { cn } from "@/lib/utils";

export const PERIODS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "365", label: "12 meses" },
] as const;

export type PeriodValue = (typeof PERIODS)[number]["value"];

export function parsePeriod(raw: string | string[] | undefined, fallback: PeriodValue = "30"): PeriodValue {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return PERIODS.some((p) => p.value === value) ? (value as PeriodValue) : fallback;
}

/** Selector de período feito com links (funciona no servidor, sem JavaScript). */
export function PeriodFilter({
  current,
  basePath,
  params = {},
}: {
  current: PeriodValue;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const hrefFor = (value: string) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, v]) => {
      if (v) search.set(key, v);
    });
    search.set("periodo", value);
    return `${basePath}?${search.toString()}`;
  };

  return (
    <div className="inline-flex rounded-xl border border-border bg-white p-1 shadow-soft" role="group" aria-label="Período">
      {PERIODS.map((period) => (
        <Link
          key={period.value}
          href={hrefFor(period.value)}
          scroll={false}
          aria-current={current === period.value ? "true" : undefined}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            current === period.value
              ? "bg-navy-700 text-white"
              : "text-navy-500 hover:bg-navy-50 hover:text-navy-700",
          )}
        >
          {period.label}
        </Link>
      ))}
    </div>
  );
}
