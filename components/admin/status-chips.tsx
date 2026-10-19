import Link from "next/link";

import { cn } from "@/lib/utils";

export interface StatusChip {
  /** Valor no URL (?estado=). Vazio = "Todos". */
  value: string;
  label: string;
  count: number;
}

/** Filtros por estado em forma de "pílulas", feitos com links (sem JavaScript). */
export function StatusChips({
  basePath,
  chips,
  current,
  params = {},
}: {
  basePath: string;
  chips: StatusChip[];
  current: string;
  params?: Record<string, string | undefined>;
}) {
  const hrefFor = (value: string) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
    if (value) search.set("estado", value);
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Filtrar por estado">
      {chips.map((chip) => {
        const active = current === chip.value;
        return (
          <Link
            key={chip.value || "todos"}
            href={hrefFor(chip.value)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "border-navy-700 bg-navy-700 text-white"
                : "border-border bg-white text-navy-500 hover:border-primary-300 hover:text-primary-700",
            )}
          >
            {chip.label}
            <span className={cn("ml-1.5 text-xs", active ? "text-white/60" : "text-navy-300")}>{chip.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
