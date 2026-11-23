"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import type { AccountOption, AccountSummary } from "@/lib/accounts";
import { accountSchema, type AccountValues } from "@/lib/validations/finance";
import { createAccount, updateAccount } from "@/app/admin/(protected)/financeiro/actions";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountSummary | null;
  /** Chamado depois de criar uma conta nova (para a seleccionar noutro formulário). */
  onCreated?: (account: AccountOption) => void;
}

const EMPTY: AccountValues = {
  name: "",
  bankName: "",
  accountNumber: "",
  openingBalance: 0,
  notes: "",
  active: true,
};

export function AccountFormDialog({ open, onOpenChange, account, onCreated }: AccountFormDialogProps) {
  const isEditing = Boolean(account);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountValues>({ resolver: zodResolver(accountSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      reset(
        account
          ? {
              name: account.name,
              bankName: account.bankName ?? "",
              accountNumber: account.accountNumber ?? "",
              openingBalance: account.openingBalance,
              notes: account.notes ?? "",
              active: account.active,
            }
          : EMPTY,
      );
    }
  }, [open, account, reset]);

  const onSubmit = async (values: AccountValues) => {
    if (isEditing && account) {
      await updateAccount(account.id, values);
    } else {
      onCreated?.(await createAccount(values));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar conta" : "Nova conta"}</DialogTitle>
          <DialogDescription>
            Bancos, carteiras digitais (como o PayPay) ou caixa: sítios onde o dinheiro entra e sai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="acc-name">Descrição *</Label>
            <Input id="acc-name" placeholder="Ex.: Conta BAI — Kodeza" {...register("name")} />
            {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="acc-bank">Banco / tipo</Label>
              <Input id="acc-bank" placeholder="BAI, BFA, PayPay, Caixa…" {...register("bankName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-number">Número da conta</Label>
              <Input id="acc-number" placeholder="IBAN ou n.º da carteira" {...register("accountNumber")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acc-balance">Saldo inicial (Kz)</Label>
            <Input id="acc-balance" type="number" step="0.01" {...register("openingBalance")} />
            <p className="text-xs text-muted-foreground">
              Quanto havia na conta quando começou a usar o sistema. A partir daí o saldo actualiza-se sozinho com o que
              recebe e gasta.
            </p>
            {errors.openingBalance && <p className="text-xs font-medium text-destructive">{errors.openingBalance.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acc-notes">Notas</Label>
            <Textarea id="acc-notes" rows={2} {...register("notes")} />
          </div>

          {isEditing && (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-600">
              <input type="checkbox" className="h-4 w-4 rounded border-border accent-[#0098DC]" {...register("active")} />
              Conta activa (aparece nas escolhas ao receber ou pagar)
            </label>
          )}

          <Button type="submit" variant="teal" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Guardar alterações" : "Criar conta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
