"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Landmark, Loader2, Plus, Wallet } from "lucide-react";

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
import { AccountFormDialog } from "@/components/admin/financeiro/account-form-dialog";
import type { AccountOption } from "@/lib/accounts";
import { cn, formatCurrency } from "@/lib/utils";

interface PaymentAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: AccountOption[];
  /** Descrição curta do que está a ser pago, ex.: "FAT-0007 · 60.000 Kz". */
  subject?: string;
  /** Guarda o pagamento. `accountId` vazio = sem indicar a conta. */
  onConfirm: (values: { accountId: string; paidAt: string }) => Promise<void> | void;
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Pop-up "Onde recebeu o pagamento?": aparece sempre que uma factura é marcada como paga,
 * para registar a conta (banco, PayPay, caixa…) e a data em que o dinheiro entrou.
 */
export function PaymentAccountDialog({ open, onOpenChange, accounts, subject, onConfirm }: PaymentAccountDialogProps) {
  const [local, setLocal] = useState<AccountOption[]>([]);
  const [selected, setSelected] = useState("");
  const [paidAt, setPaidAt] = useState(today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const all = [...accounts, ...local.filter((l) => !accounts.some((a) => a.id === l.id))];

  useEffect(() => {
    if (open) {
      setSelected(accounts[0]?.id ?? "");
      setPaidAt(today());
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const confirm = async (accountId: string) => {
    setSaving(true);
    setError(null);
    try {
      await onConfirm({ accountId, paidAt });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível guardar o pagamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Onde recebeu o pagamento?</DialogTitle>
            <DialogDescription>
              {subject ? `${subject}. ` : ""}Escolha a conta onde o dinheiro entrou, para saber sempre onde está.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {all.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Ainda não tem contas. Crie a primeira (banco, PayPay, caixa…) para registar onde recebeu.
              </div>
            ) : (
              <ul className="space-y-2" role="radiogroup" aria-label="Conta de recebimento">
                {all.map((account) => {
                  const active = selected === account.id;
                  const Icon = /pay|express|carteira|wallet/i.test(`${account.bankName} ${account.name}`) ? Wallet : Landmark;
                  return (
                    <li key={account.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelected(account.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                          active ? "border-primary-500 bg-primary-50/60 ring-1 ring-primary-500" : "border-border hover:bg-navy-50",
                        )}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-soft">
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-navy-700">{account.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {[account.bankName, account.accountNumber].filter(Boolean).join(" · ") || "Sem detalhes"}
                          </span>
                        </span>
                        <span className="text-right text-xs text-muted-foreground">
                          Saldo
                          <span className="block text-sm font-bold text-navy-700">{formatCurrency(account.balance)}</span>
                        </span>
                        {active && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <Button type="button" variant="outline" size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova conta
            </Button>

            <div className="space-y-1.5">
              <Label htmlFor="paidAt">Data em que recebeu</Label>
              <Input id="paidAt" type="date" value={paidAt} max={today()} onChange={(e) => setPaidAt(e.target.value)} />
            </div>

            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>}

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                type="button"
                variant="teal"
                className="sm:flex-1"
                disabled={saving || !selected}
                onClick={() => confirm(selected)}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar pagamento
              </Button>
              <Button type="button" variant="ghost" disabled={saving} onClick={() => confirm("")}>
                Registar sem indicar a conta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Irmão do pop-up (não filho) para os eventos do formulário não "subirem" para o formulário da factura. */}
      <AccountFormDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={(account) => {
          setLocal((current) => [...current, account]);
          setSelected(account.id);
        }}
      />
    </>
  );
}
