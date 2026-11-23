import { z } from "zod";

import { EXPENSE_CATEGORIES } from "@/lib/expense-labels";

export const accountSchema = z.object({
  name: z.string().trim().min(2, "Dê um nome à conta (ex.: Conta BAI — Kodeza).").max(100),
  bankName: z.string().trim().max(60).optional().or(z.literal("")),
  accountNumber: z.string().trim().max(60).optional().or(z.literal("")),
  openingBalance: z.coerce.number().min(-1_000_000_000).max(1_000_000_000),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.boolean(),
});
export type AccountValues = z.infer<typeof accountSchema>;

export const expenseSchema = z.object({
  description: z.string().trim().min(2, "Descreva a despesa.").max(160),
  amount: z.coerce.number().positive("Informe um valor maior que zero.").max(1_000_000_000),
  date: z.string().min(1, "Informe a data."),
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]),
  supplier: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  accountId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
});
export type ExpenseValues = z.infer<typeof expenseSchema>;
