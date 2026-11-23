"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/financeiro", label: "Resumo" },
  { href: "/admin/financeiro/despesas", label: "Despesas" },
  { href: "/admin/financeiro/contas", label: "Contas" },
];

/** Separadores do módulo financeiro. Mantêm o período escolhido ao mudar de separador. */
export function FinanceTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const keep = new URLSearchParams();
  ["periodo", "de", "ate"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) keep.set(key, value);
  });
  const suffix = keep.toString() ? `?${keep.toString()}` : "";

  return (
    <nav className="mb-6 flex gap-1 border-b border-border" aria-label="Financeiro">
      {TABS.map((tab) => {
        const active = tab.href === "/admin/financeiro" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${tab.href === "/admin/financeiro/contas" ? "" : suffix}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "border-primary-500 text-primary-700"
                : "border-transparent text-navy-400 hover:text-navy-700",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
