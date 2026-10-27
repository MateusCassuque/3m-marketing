"use client";

import { Download } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_BADGE } from "@/lib/invoice-labels";
import { formatCurrency } from "@/lib/utils";

import type { InvoiceRow } from "./invoices-table";
import { generateInvoicePdf } from "@/lib/generate-invoice-pdf";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

function isOverdue(invoice: InvoiceRow) {
    return invoice.status === "PENDENTE" && new Date(invoice.dueDate) < new Date();
}

export function InvoiceViewDialog({
    open,
    onOpenChange,
    invoice,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: InvoiceRow | null;
}) {
    if (!invoice) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Fatura {invoice.number}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={isOverdue(invoice) ? "destructive" : INVOICE_STATUS_BADGE[invoice.status]}>
                            {isOverdue(invoice) ? "Vencida" : INVOICE_STATUS_LABELS[invoice.status]}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 border-t border-border pt-3">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="text-right font-medium text-navy-700">{invoice.project.client.name}</span>

                        <span className="text-muted-foreground">Pedido</span>
                        <span className="text-right font-medium text-navy-700">{invoice.project.title}</span>

                        <span className="text-muted-foreground">Valor desta factura</span>
                        <span className="text-right font-semibold text-navy-700">{formatCurrency(invoice.amount)}</span>

                        <span className="text-muted-foreground">Vencimento</span>
                        <span className="text-right text-navy-700">{dateFormatter.format(new Date(invoice.dueDate))}</span>

                        {invoice.paymentMethod && (
                            <>
                                <span className="text-muted-foreground">Pagamento</span>
                                <span className="text-right text-navy-700">{invoice.paymentMethod}</span>
                            </>
                        )}
                    </div>

                    {invoice.projectTotal !== null && invoice.status !== "CANCELADA" && (
                        <div className="space-y-2 rounded-xl bg-navy-50/70 p-3.5">
                            <p className="text-xs font-semibold text-navy-500">
                                {invoice.installment}.ª factura do pedido
                            </p>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total do pedido</span>
                                <span className="font-medium text-navy-700">{formatCurrency(invoice.projectTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Já facturado antes</span>
                                <span className="font-medium text-navy-700">{formatCurrency(invoice.previouslyInvoiced ?? 0)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2">
                                <span className="font-semibold text-navy-700">Valor em falta</span>
                                {(invoice.remaining ?? 0) > 0 ? (
                                    <span className="font-bold text-accent-700">{formatCurrency(invoice.remaining ?? 0)}</span>
                                ) : (
                                    <span className="font-bold text-emerald-600">Nada em falta</span>
                                )}
                            </div>
                        </div>
                    )}

                    {invoice.notes && (
                        <div className="border-t border-border pt-3">
                            <p className="mb-1 text-muted-foreground">Observações</p>
                            <p className="text-navy-700">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button
                        variant="teal"
                        onClick={() => generateInvoicePdf(invoice)}
                        className="w-full sm:w-auto"
                    >
                        <Download className="h-4 w-4" />
                        Baixar PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}