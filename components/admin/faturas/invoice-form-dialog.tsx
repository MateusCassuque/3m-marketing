"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Plus, TriangleAlert } from "lucide-react";
import type { Client } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { invoiceSchema, type InvoiceValues, INVOICE_STATUS_VALUES } from "@/lib/validations/invoice";
import { INVOICE_STATUS_LABELS } from "@/lib/invoice-labels";
import { computeBalance } from "@/lib/invoice-balance";
import { formatCurrency } from "@/lib/utils";
import type { AccountOption } from "@/lib/accounts";
import { PaymentAccountDialog } from "@/components/admin/faturas/payment-account-dialog";
import { ProjectFormDialog } from "@/components/admin/pedidos/project-form-dialog";
import { createInvoice, updateInvoice } from "@/app/admin/(protected)/faturas/actions";

export interface InvoiceFormData {
  id: string;
  number: string;
  projectId: string;
  amount: number;
  status: InvoiceValues["status"];
  issueDate: Date;
  dueDate: Date;
  paymentMethod: string | null;
  notes: string | null;
  settlesProject: boolean;
  createdAt: Date;
  accountId: string | null;
  paidAt: Date | null;
}

export interface ProjectOption {
  id: string;
  title: string;
  value: number;
  client: { name: string };
  /** Projecto de cobrança recorrente: as facturas são geradas sozinhas, sem controlo de parcelas. */
  recurring: boolean;
  /** Fase actual do pedido — para avisar que o pagamento a vai avançar. */
  status: string;
  /** Facturas não canceladas do pedido — servem para calcular o que já foi facturado. */
  invoices: { id: string; amount: number; createdAt: string }[];
}

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: InvoiceFormData | null;
  projects: ProjectOption[];
  /** Clientes e contas: permitem criar pedido/cliente/conta sem sair do formulário. */
  clients: Client[];
  accounts: AccountOption[];
  /** Pedido já seleccionado (ex.: ao emitir a factura a partir do próprio pedido). */
  defaultProjectId?: string;
}

const EMPTY_VALUES: InvoiceValues = {
  projectId: "",
  amount: 0,
  status: "PENDENTE",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  paymentMethod: "",
  notes: "",
  settlesProject: false,
  accountId: "",
  paidAt: "",
};

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
  projects,
  clients,
  accounts,
  defaultProjectId,
}: InvoiceFormDialogProps) {
  const isEditing = Boolean(invoice);

  // Pedidos criados aqui mesmo ficam logo disponíveis (o servidor actualiza as listas a seguir).
  const [localProjects, setLocalProjects] = useState<ProjectOption[]>([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<InvoiceValues | null>(null);
  const allProjects = [...projects, ...localProjects.filter((lp) => !projects.some((p) => p.id === lp.id))];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedProjectId = watch("projectId");
  const watchedAmount = Number(watch("amount")) || 0;
  const settles = Boolean(watch("settlesProject"));

  const project = allProjects.find((p) => p.id === selectedProjectId);

  // Facturas anteriores do pedido: todas, ou — ao editar — só as criadas antes desta.
  const previous = useMemo(() => {
    if (!project) return { sum: 0, count: 0 };
    const list = project.invoices.filter((inv) => {
      if (invoice && inv.id === invoice.id) return false;
      if (invoice) return new Date(inv.createdAt) < new Date(invoice.createdAt);
      return true;
    });
    return { sum: list.reduce((acc, inv) => acc + inv.amount, 0), count: list.length };
  }, [project, invoice]);

  const balance = project && !project.recurring
    ? computeBalance({
        total: project.value,
        previouslyInvoiced: previous.sum,
        amount: watchedAmount,
        settles,
      })
    : null;

  useEffect(() => {
    if (open) {
      reset(
        invoice
          ? {
            projectId: invoice.projectId,
            amount: invoice.amount,
            status: invoice.status,
            issueDate: toDateInputValue(invoice.issueDate),
            dueDate: toDateInputValue(invoice.dueDate),
            paymentMethod: invoice.paymentMethod ?? "",
            notes: invoice.notes ?? "",
            settlesProject: invoice.settlesProject,
            accountId: invoice.accountId ?? "",
            paidAt: invoice.paidAt ? toDateInputValue(invoice.paidAt) : "",
          }
          : EMPTY_VALUES,
      );

      // Factura nova a partir de um pedido: já vem seleccionado, com o valor sugerido.
      if (!invoice && defaultProjectId) {
        const chosen = projects.find((p) => p.id === defaultProjectId);
        if (chosen) selectProject(chosen);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice, reset, defaultProjectId]);

  // Ao escolher o pedido numa factura nova, sugere o valor: o que falta facturar (ou o de uma cobrança, se recorrente).
  function selectProject(chosen: ProjectOption) {
    setValue("projectId", chosen.id, { shouldValidate: true });
    setValue("settlesProject", false);
    if (!isEditing) {
      const invoiced = chosen.invoices.reduce((acc, inv) => acc + inv.amount, 0);
      const left = Math.max(chosen.value - invoiced, 0);
      setValue("amount", chosen.recurring ? chosen.value : left > 0 ? left : chosen.value);
    }
  }

  const handleProjectChange = (projectId: string) => {
    const chosen = allProjects.find((p) => p.id === projectId);
    if (chosen) selectProject(chosen);
    else setValue("projectId", projectId);
  };

  const save = async (values: InvoiceValues) => {
    if (isEditing && invoice) {
      await updateInvoice(invoice.id, values);
    } else {
      await createInvoice(values);
    }
    setPaymentOpen(false);
    setPendingValues(null);
    onOpenChange(false);
  };

  const onSubmit = async (values: InvoiceValues) => {
    // Factura paga sem conta indicada: pergunta primeiro onde o dinheiro entrou.
    const alreadyHasAccount = Boolean(invoice && invoice.status === "PAGA" && invoice.accountId);
    if (values.status === "PAGA" && !values.accountId && !alreadyHasAccount) {
      setPendingValues(values);
      setPaymentOpen(true);
      return;
    }
    await save(values);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar fatura ${invoice?.number}` : "Nova fatura"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da fatura."
              : "O número da fatura é gerado automaticamente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="projectId">Pedido</Label>
              <button
                type="button"
                onClick={() => setProjectDialogOpen(true)}
                className="inline-flex items-center gap-1 rounded-md text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Novo pedido
              </button>
            </div>
            <Select
              id="projectId"
              value={selectedProjectId}
              onChange={(event) => handleProjectChange(event.target.value)}
            >
              <option value="">Selecione…</option>
              {allProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title} — {project.client.name}
                </option>
              ))}
            </Select>
            {errors.projectId && (
              <p className="text-xs font-medium text-destructive">{errors.projectId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor (Kz)</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
              {errors.amount && (
                <p className="text-xs font-medium text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                {INVOICE_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {INVOICE_STATUS_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {watch("status") === "PAGA" && project?.status === "BACKLOG" && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[13px] leading-snug text-emerald-800">
              Ao guardar como paga, o pedido passa automaticamente de <strong>Backlog</strong> a <strong>Em andamento</strong>.
            </p>
          )}
          {watch("status") === "PAGA" && project?.status === "EM_ANDAMENTO" && !project.recurring && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[13px] leading-snug text-emerald-800">
              Se esta for a última factura do pedido (tudo facturado e pago), o pedido passa automaticamente a{" "}
              <strong>Em revisão</strong>.
            </p>
          )}

          {project?.recurring && (
            <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 text-sm leading-snug text-primary-900">
              <p className="font-semibold">Projecto de cobrança recorrente</p>
              <p className="mt-1 text-primary-800">
                O sistema emite sozinho uma factura em cada data de cobrança. Esta será uma factura avulsa (por exemplo, um
                extra) e não entra no controlo de parcelas.
              </p>
            </div>
          )}

          {project && balance && (
            <div className="space-y-3 rounded-xl border border-border bg-navy-50/60 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-navy-700">
                  {previous.count + 1}.ª factura deste pedido
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {balance.remainingBefore > 0 && (
                    <button
                      type="button"
                      onClick={() => setValue("amount", balance.remainingBefore, { shouldValidate: true })}
                      className="rounded-full border border-primary-200 bg-white px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                    >
                      Cobrar o restante ({formatCurrency(balance.remainingBefore)})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setValue("amount", project.value, { shouldValidate: true })}
                    className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                  >
                    Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("amount", project.value / 2, { shouldValidate: true })}
                    className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                  >
                    50%
                  </button>
                </div>
              </div>

              <dl className="space-y-1.5">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Total do pedido</dt>
                  <dd className="font-medium text-navy-700">{formatCurrency(balance.total)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Já facturado antes</dt>
                  <dd className="font-medium text-navy-700">{formatCurrency(balance.previouslyInvoiced)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Valor a cobrar nesta factura</dt>
                  <dd className="font-medium text-navy-700">{formatCurrency(balance.amount)}</dd>
                </div>
              </dl>

              <div
                className={
                  balance.excess > 0
                    ? "flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2.5 text-red-700"
                    : balance.remaining > 0
                      ? "flex items-center justify-between gap-3 rounded-lg bg-accent-50 px-3 py-2.5 text-accent-700"
                      : "flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-emerald-700"
                }
              >
                <span className="flex items-center gap-2 font-semibold">
                  {balance.excess > 0 ? (
                    <TriangleAlert className="h-4 w-4" />
                  ) : balance.remaining > 0 ? null : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {balance.excess > 0
                    ? "Ultrapassa o total do pedido"
                    : balance.remaining > 0
                      ? "Valor em falta"
                      : "Nada em falta"}
                </span>
                <span className="font-display text-base font-bold">
                  {balance.excess > 0 ? `+ ${formatCurrency(balance.excess)}` : formatCurrency(balance.remaining)}
                </span>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-navy-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border accent-[#0098DC]"
                  {...register("settlesProject")}
                />
                <span>
                  <strong className="text-navy-700">Esta factura fecha o pedido</strong> — não falta cobrar mais nada
                  (por exemplo, a última parcela ou um acordo com desconto).
                </span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="issueDate">Emissão</Label>
              <Input id="issueDate" type="date" {...register("issueDate")} />
              {errors.issueDate && (
                <p className="text-xs font-medium text-destructive">{errors.issueDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-xs font-medium text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paymentMethod">Forma de pagamento</Label>
            <Input id="paymentMethod" placeholder="Pix, boleto, cartão…" {...register("paymentMethod")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <Button type="submit" variant="teal" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Cadastrar fatura"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>

    {/* Irmãos do pop-up principal (não filhos do <form>): os eventos de submit não sobem para a factura. */}
    <ProjectFormDialog
      open={projectDialogOpen}
      onOpenChange={setProjectDialogOpen}
      clients={clients}
      onCreated={(created) => {
        const option: ProjectOption = {
          id: created.id,
          title: created.title,
          value: created.value,
          client: { name: created.clientName },
          recurring: created.billingType === "RECORRENTE",
          status: created.status,
          invoices: [],
        };
        setLocalProjects((current) => [...current, option]);
        selectProject(option);
      }}
    />

    <PaymentAccountDialog
      open={paymentOpen}
      onOpenChange={(next) => {
        setPaymentOpen(next);
        if (!next) setPendingValues(null);
      }}
      accounts={accounts}
      subject={pendingValues ? `Factura de ${formatCurrency(Number(pendingValues.amount))}` : undefined}
      onConfirm={async ({ accountId, paidAt }) => {
        if (pendingValues) await save({ ...pendingValues, accountId, paidAt });
      }}
    />
    </>
  );
}
