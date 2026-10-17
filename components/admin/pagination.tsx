import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PAGE_SIZE } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  /** Parâmetros a manter no URL (pesquisa, filtros…). */
  params?: Record<string, string | undefined>;
  className?: string;
}

function pagesToShow(page: number, totalPages: number): (number | "…")[] {
  const set = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function Pagination({ basePath, page, totalPages, total, params = {}, className }: PaginationProps) {
  if (total === 0) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors";

  return (
    <nav
      aria-label="Paginação"
      className={cn("flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row", className)}
    >
      <p className="text-sm text-muted-foreground">
        {from}–{to} de {total}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {page > 1 ? (
            <Link href={href(page - 1)} className={cn(btn, "border border-border text-navy-600 hover:bg-navy-50")} aria-label="Página anterior">
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Anterior</span>
            </Link>
          ) : (
            <span className={cn(btn, "border border-border text-navy-200")} aria-disabled="true">
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Anterior</span>
            </span>
          )}

          <span className="px-2 text-sm font-medium text-navy-600 sm:hidden">
            {page} / {totalPages}
          </span>

          <div className="hidden items-center gap-1.5 sm:flex">
            {pagesToShow(page, totalPages).map((item, i) =>
              item === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <Link
                  key={item}
                  href={href(item)}
                  aria-current={item === page ? "page" : undefined}
                  className={cn(
                    btn,
                    item === page ? "bg-navy-700 text-white" : "text-navy-600 hover:bg-navy-50",
                  )}
                >
                  {item}
                </Link>
              ),
            )}
          </div>

          {page < totalPages ? (
            <Link href={href(page + 1)} className={cn(btn, "border border-border text-navy-600 hover:bg-navy-50")} aria-label="Página seguinte">
              <span className="mr-1 hidden sm:inline">Seguinte</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className={cn(btn, "border border-border text-navy-200")} aria-disabled="true">
              <span className="mr-1 hidden sm:inline">Seguinte</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
