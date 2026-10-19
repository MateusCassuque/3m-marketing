import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-navy-500 hover:text-primary-700"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}

export function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-display text-2xl font-bold",
          tone === "default" && "text-navy-700",
          tone === "success" && "text-emerald-600",
          tone === "warning" && "text-accent-600",
          tone === "danger" && "text-red-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
      <h2 className="flex items-center justify-between border-b border-border px-6 py-4 font-display text-base font-bold text-navy-700">
        {title}
        {count !== undefined && (
          <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-500">{count}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

export function DefinitionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-navy-700">{children}</dd>
    </div>
  );
}
