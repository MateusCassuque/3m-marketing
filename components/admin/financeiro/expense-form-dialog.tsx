"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import type { ExpenseCategory } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AccountFormDialog } from "@/components/admin/financeiro/account-form-dialog";
import type { AccountOption } from "@/lib/accounts";
import { EXPENSE_CATEGORIES, EXPENSE_LABELS } from "@/lib/expense-labels";
import { expenseSchema, type ExpenseValues } from "@/lib/validations/finance";
import { formatCurrency } from "@/lib/utils";
import { createExpense, updateExpense } from "@/app/admin/(protected)/financeiro/actions";

export interface ExpenseRow {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  supplier: string | null;
  notes: string | null;
  accountId: string | null;
  accountName: string | null;
  projectId: string | null;
  projectTitle: string | null;
}

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseRow | null;
  accounts: AccountOption[];
  projects: { id: string; title: string }[];
}

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = (): ExpenseValues => ({
  description: "",
  amount: 0,
  date: today(),
  category: "OUTROS",
  supplier: "",
  notes: "",
  accountId: "",
  projectId: "",
});

export function ExpenseFormDialog({ open, onOpenChange, expense, accounts: accountsProp, projects }: ExpenseFormDialogProps) {
  const isEditing = Boolean(expense);
  const [localAccounts, setLocalAccounts] = useState<AccountOption[]>([]);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const accounts = [...accountsProp, ...localAccounts.filter((l) => !accountsProp.some((a) => a.id === l.id))];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseValues>({ resolver: zodResolver(expenseSchema), defaultValues: EMPTY() });

  useEffect(() => {
    if (open) {
      reset(
        expense
          ? {
              description: expense.description,
              amount: expense.amount,
              date: new Date(expense.date).toISOString().slice(0, 10),
              category: expense.category,
              supplier: expense.supplier ?? "",
              notes: expense.notes ?? "",
              accountId: expense.accountId ?? "",
              projectId: expense.projectId ?? "",
            }
          : EMPTY(),
      );
    }
  }, [open, expense, reset]);

  const onSubmit = async (values: ExpenseValues) => {
    if (isEditing && expense) await updateExpense(expense.id, values);
    else await createExpense(values);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar despesa" : "Nova despesa"}</DialogTitle>
            <DialogDescription>Registe o que gastou e de que conta saiu o dinheiro.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exp-desc">Descrição *</Label>
              <Input id="exp-desc" placeholder="Ex.: Renda do escritório — Novembro" {...register("description")} />
              {errors.description && <p className="text-xs font-medium text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="exp-amount">Valor (Kz) *</Label>
                <Input id="exp-amount" type="number" step="0.01" min="0" {...register("amount")} />
                {errors.amount && <p className="text-xs font-medium text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-date">Data *</Label>
                <Input id="exp-date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs font-medium text-destructive">{errors.date.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="exp-category">Categoria</Label>
                <Select id="exp-category" {...register("category")}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {EXPENSE_LABELS[c]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-supplier">Fornecedor (opcional)</Label>
                <Input id="exp-supplier" {...register("supplier")} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="exp-account">Saiu da conta</Label>
                  <button
                    type="button"
                    onClick={() => setAccountDialogOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nova conta
                  </button>
                </div>
                <Select id="exp-account" {...register("accountId")}>
                  <option value="">Sem indicar</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {formatCurrency(a.balance)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-project">Pedido (opcional)</Label>
                <Select id="exp-project" {...register("projectId")}>
                  <option value="">Despesa geral</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-notes">Notas</Label>
              <Textarea id="exp-notes" rows={2} {...register("notes")} />
            </div>

            <Button type="submit" variant="teal" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar alterações" : "Registar despesa"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AccountFormDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        onCreated={(account) => {
          setLocalAccounts((current) => [...current, account]);
          setValue("accountId", account.id);
        }}
      />
    </>
  );
}
