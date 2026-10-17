"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: "default" | "primary" | "danger";
  disabled?: boolean;
}

const ICON_TONE = {
  default: "text-navy-500 hover:bg-navy-50 hover:text-navy-700",
  primary: "text-navy-500 hover:bg-primary-50 hover:text-primary-600",
  danger: "text-navy-500 hover:bg-red-50 hover:text-red-600",
};

const CARD_TONE = {
  default: "text-navy-600 bg-navy-50 hover:bg-navy-100",
  primary: "text-primary-700 bg-primary-50 hover:bg-primary-100",
  danger: "text-red-600 bg-red-50 hover:bg-red-100",
};

/** Botões só com ícone — para a coluna "Ações" da tabela (ecrãs médios e grandes). */
export function RowActions({ actions, subject }: { actions: RowAction[]; subject: string }) {
  return (
    <div className="flex justify-end gap-1">
      {actions.map(({ label, icon: Icon, onClick, tone = "default", disabled }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          disabled={disabled}
          title={label}
          aria-label={`${label} ${subject}`}
          className={cn("rounded-lg p-2 transition-colors disabled:opacity-50", ICON_TONE[tone])}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

/** Botões com texto, grandes para o toque — para os cartões no telemóvel. */
export function CardActions({ actions, subject }: { actions: RowAction[]; subject: string }) {
  return (
    <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}>
      {actions.map(({ label, icon: Icon, onClick, tone = "default", disabled }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={`${label} ${subject}`}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50",
            CARD_TONE[tone],
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

/** Classes partilhadas para a coluna de ações fixa à direita da tabela. */
export const STICKY_TH =
  "sticky right-0 z-10 bg-muted px-5 py-3 text-right shadow-[-10px_0_10px_-10px_rgba(4,19,46,0.18)]";
export const STICKY_TD =
  "sticky right-0 bg-white px-5 py-3.5 shadow-[-10px_0_10px_-10px_rgba(4,19,46,0.12)] group-hover:bg-[#F4FAFE]";
