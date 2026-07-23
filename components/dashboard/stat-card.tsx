import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: "teal" | "navy" | "accent" | "success" | "destructive";
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  teal: "bg-primary-50 text-primary-600",
  navy: "bg-navy-50 text-navy-600",
  accent: "bg-accent-50 text-accent-600",
  success: "bg-emerald-50 text-emerald-600",
  destructive: "bg-red-50 text-red-600",
};

export function StatCard({ icon: Icon, label, value, accent = "teal" }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-soft">
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          ACCENT_STYLES[accent],
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold text-navy-700">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
