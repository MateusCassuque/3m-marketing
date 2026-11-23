"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceViewDialog } from "@/components/admin/faturas/invoice-view-dialog";
import type { InvoiceRow } from "@/components/admin/faturas/invoices-table";
import { INVOICE_STATUS_BADGE, INVOICE_STATUS_LABELS } from "@/lib/invoice-labels";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";

function overdue(invoice: InvoiceRow) {
  return invoice.status === "VENCIDA" || (invoice.status === "PENDENTE" && new Date(invoice.dueDate) < new Date());
}

/** Lista compacta de facturas (cartões em todos os ecrãs) com acesso ao detalhe e PDF. */
export function InvoiceList({
  invoices,
  showProject = false,
  emptyText = "Ainda não há facturas.",
}: {
  invoices: InvoiceRow[];
  /** Mostra o nome do pedido (útil na página do cliente). */
  showProject?: boolean;
  emptyText?: string;
}) {
  const [viewing, setViewing] = useState<InvoiceRow | null>(null);

  if (invoices.length === 0) {
    return <p className="px-6 py-10 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {invoices.map((invoice) => {
          const late = overdue(invoice);
          return (
            <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
              <div className="min-w-0">
                <p className="font-display font-bold text-navy-700">{invoice.number}</p>
                {showProject && (
                  <Link
                    href={`/admin/pedidos/${invoice.projectId}`}
                    className="block truncate text-sm text-primary-700 hover:underline"
                  >
                    {invoice.project.title}
                  </Link>
                )}
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Vence {formatDateNotTime(invoice.dueDate)}
                </p>
                {invoice.status !== "CANCELADA" && invoice.remaining !== null && (
                  <p className="mt-0.5 text-xs font-medium">
                    {invoice.installment !== null && <span className="text-muted-foreground">{invoice.installment}.ª factura · </span>}
                    {invoice.remaining > 0 ? (
                      <span className="text-accent-700">Em falta {formatCurrency(invoice.remaining)}</span>
                    ) : (
                      <span className="text-emerald-600">Nada em falta</span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={late ? "destructive" : INVOICE_STATUS_BADGE[invoice.status]}>
                  {late ? "Vencida" : INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
                <span className="text-center font-display font-bold text-navy-700">
                  {formatCurrency(invoice.amount)}
                </span>
                <Button variant="outline" size="sm" onClick={() => setViewing(invoice)} aria-label={`Ver factura ${invoice.number}`}>
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <InvoiceViewDialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)} invoice={viewing} />
    </>
  );
}
