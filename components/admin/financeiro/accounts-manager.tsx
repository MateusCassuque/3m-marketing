"use client";

import { useState } from "react";
import { Landmark, Pencil, Plus, Trash2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountFormDialog } from "@/components/admin/financeiro/account-form-dialog";
import type { AccountSummary } from "@/lib/accounts";
import { cn, formatCurrency } from "@/lib/utils";
import { deleteAccount } from "@/app/admin/(protected)/financeiro/actions";

export function AccountsManager({ accounts }: { accounts: AccountSummary[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AccountSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const total = accounts.filter((a) => a.active).reduce((sum, a) => sum + a.balance, 0);

  const handleDelete = async (account: AccountSummary) => {
    if (!window.confirm(`Eliminar a conta "${account.name}"?`)) return;
    setBusy(true);
    try {
      await deleteAccount(account.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível eliminar a conta.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Saldo total das contas activas: <strong className="text-lg text-navy-700">{formatCurrency(total)}</strong>
        </p>
        <Button
          variant="teal"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Ainda não tem contas. Crie a primeira (banco, PayPay, caixa…) para saber onde está o seu dinheiro.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => {
            const Icon = /pay|express|carteira|wallet/i.test(`${account.bankName} ${account.name}`) ? Wallet : Landmark;
            return (
              <article
                key={account.id}
                className={cn(
                  "relative rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(4,19,46,0.05),0_8px_24px_-12px_rgba(4,19,46,0.08)] ring-1 ring-navy-900/[0.04]",
                  !account.active && "opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[15px] font-bold text-navy-700">{account.name}</h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {[account.bankName, account.accountNumber].filter(Boolean).join(" · ") || "Sem detalhes"}
                      </p>
                    </div>
                  </div>
                  {!account.active && (
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-400">Inactiva</span>
                  )}
                </div>

                <p className="mt-5 text-xs font-medium text-muted-foreground">Saldo actual</p>
                <p className={cn("font-display text-[1.75rem] font-bold leading-tight", account.balance < 0 ? "text-red-600" : "text-navy-700")}>
                  {formatCurrency(account.balance)}
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Inicial</dt>
                    <dd className="mt-0.5 font-semibold text-navy-600">{formatCurrency(account.openingBalance)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Recebido</dt>
                    <dd className="mt-0.5 font-semibold text-emerald-600">+{formatCurrency(account.received)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Gasto</dt>
                    <dd className="mt-0.5 font-semibold text-accent-700">−{formatCurrency(account.spent)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(account);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" disabled={busy} onClick={() => handleDelete(account)}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AccountFormDialog open={open} onOpenChange={setOpen} account={editing} />
    </div>
  );
}
