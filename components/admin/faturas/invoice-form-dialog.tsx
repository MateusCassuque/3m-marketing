"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
}

export interface ProjectOption {
  id: string;
  title: string;
  value: number;
  client: { name: string };
}

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: InvoiceFormData | null;
  projects: ProjectOption[];
}

const EMPTY_VALUES: InvoiceValues = {
  projectId: "",
  amount: 0,
  status: "PENDENTE",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  paymentMethod: "",
  notes: "",
};

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function InvoiceFormDialog({ open, onOpenChange, invoice, projects }: InvoiceFormDialogProps) {
  const isEditing = Boolean(invoice);

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
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, invoice, reset]);

  // Conveniência: ao escolher o pedido numa fatura nova, sugere o valor do pedido.
  const handleProjectChange = (projectId: string) => {
    setValue("projectId", projectId);
    if (!isEditing) {
      const project = projects.find((p) => p.id === projectId);
      if (project) setValue("amount", project.value);
    }
  };

  const onSubmit = async (values: InvoiceValues) => {
    if (isEditing && invoice) {
      await updateInvoice(invoice.id, values);
    } else {
      await createInvoice(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            <Label htmlFor="projectId">Pedido</Label>
            <Select
              id="projectId"
              value={selectedProjectId}
              onChange={(event) => handleProjectChange(event.target.value)}
            >
              <option value="">Selecione…</option>
              {projects.map((project) => (
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
              <Label htmlFor="amount">Valor (R$)</Label>
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
  );
}
