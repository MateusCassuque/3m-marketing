import type { ExpenseCategory } from "@prisma/client";

export const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  SALARIOS: "Salários e colaboradores",
  RENDA: "Renda e escritório",
  FERRAMENTAS: "Software e ferramentas",
  MARKETING: "Publicidade e marketing",
  TRANSPORTE: "Transporte e deslocações",
  IMPOSTOS: "Impostos e taxas",
  EQUIPAMENTO: "Equipamento",
  SERVICOS_TERCEIROS: "Serviços de terceiros",
  OUTROS: "Outras despesas",
};

export const EXPENSE_CATEGORIES = Object.keys(EXPENSE_LABELS) as ExpenseCategory[];

/** Cores dos gráficos por categoria (ordem fixa). */
export const EXPENSE_COLORS = ["#0098DC", "#0A2A5E", "#FF7F0A", "#5CC8F2", "#4F6C9B", "#E11D48", "#8B5CF6", "#10B981", "#B3C2DB"];
