"use client";

import { useState } from "react";
import { Landmark, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { SearchForm } from "@/components/admin/list-toolbar";
import {
  CardActions,
  RowActions,
  STICKY_TD,
  STICKY_TH,
  type RowAction,
} from "@/components/admin/row-actions";
import { ExpenseFormDialog, type ExpenseRow } from "@/components/admin/financeiro/expense-form-dialog";
import type { AccountOption } from "@/lib/accounts";
import { EXPENSE_LABELS } from "@/lib/expense-labels";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";
import { deleteExpense } from "@/app/admin/(protected)/financeiro/actions";

interface ExpensesTableProps {
  expenses: ExpenseRow[];
  accounts: AccountOption[];
  projects: { id: string; title: string }[];
  q: string;
  estado: string;
  range: { periodo?: string; de?: string; ate?: string };
  page: number;
  totalPages: number;
  total: number;
  /** Soma das despesas com os filtros actuais (todas as páginas). */
  filteredTotal: number;
}

export function ExpensesTable({
  expenses,
  accounts,
  projects,
  q,
  estado,
  range,
  page,
  totalPages,
  total,
  filteredTotal,
}: ExpensesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [busy, setBusy] = useState(false);

  const handleDelete = async (expense: ExpenseRow) => {
    if (!window.confirm(`Eliminar a despesa "${expense.description}"?`)) return;
    setBusy(true);
    try {
      await deleteExpense(expense.id);
    } catch (error) {
      console.error(error);
      window.alert("Não foi possível eliminar a despesa.");
    } finally {
      setBusy(false);
    }
  };

  const actionsFor = (expense: ExpenseRow): RowAction[] => [
    {
      label: "Editar",
      icon: Pencil,
      tone: "primary",
      onClick: () => {
        setEditing(expense);
        setDialogOpen(true);
      },
    },
    { label: "Eliminar", icon: Trash2, tone: "danger", disabled: busy, onClick: () => handleDelete(expense) },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchForm
          q={q}
          basePath="/admin/financeiro/despesas"
          hidden={{ estado, ...range }}
          placeholder="Pesquisar descrição ou fornecedor…"
        />
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-sm text-muted-foreground">
            Total: <strong className="text-navy-700">{formatCurrency(filteredTotal)}</strong>
          </p>
          <Button
            variant="teal"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova despesa
          </Button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex h-40 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {q || estado || range.periodo ? "Nenhuma despesa encontrada com estes filtros." : "Ainda não registou despesas."}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border md:hidden">
            {expenses.map((expense) => (
              <li key={expense.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-navy-700">{expense.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {EXPENSE_LABELS[expense.category]} · {formatDateNotTime(expense.date)}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-base font-bold text-accent-700">{formatCurrency(expense.amount)}</p>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {expense.accountName && (
                    <p className="flex items-center gap-1.5">
                      <Landmark className="h-3.5 w-3.5" /> {expense.accountName}
                    </p>
                  )}
                  {expense.supplier && <p>Fornecedor: {expense.supplier}</p>}
                  {expense.projectTitle && <p>Pedido: {expense.projectTitle}</p>}
                </div>
                <CardActions actions={actionsFor(expense)} subject={expense.description} />
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Descrição</th>
                  <th className="px-5 py-3">Categoria</th>
                  <th className="px-5 py-3">Conta</th>
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3 text-right">Valor</th>
                  <th className={STICKY_TH}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="group border-b border-border last:border-0 hover:bg-primary-50/40">
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{formatDateNotTime(expense.date)}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-navy-700">{expense.description}</div>
                      {expense.supplier && <div className="text-xs text-muted-foreground">{expense.supplier}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-navy-600">{EXPENSE_LABELS[expense.category]}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{expense.accountName ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{expense.projectTitle ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-accent-700">{formatCurrency(expense.amount)}</td>
                    <td className={STICKY_TD}>
                      <RowActions actions={actionsFor(expense)} subject={expense.description} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination
        basePath="/admin/financeiro/despesas"
        page={page}
        totalPages={totalPages}
        total={total}
        params={{ q, estado, ...range }}
      />

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editing}
        accounts={accounts}
        projects={projects}
      />
    </div>
  );
}
