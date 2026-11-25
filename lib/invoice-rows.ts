import type { Client, Invoice, Project } from "@prisma/client";

import type { InvoiceRow } from "@/components/admin/faturas/invoices-table";
import { parseServiceDetails } from "@/lib/service-details";

/** O que é preciso carregar do pedido de cada factura (nome, serviço, requerentes e dados do cliente). */
export const INVOICE_PROJECT_SELECT = {
  title: true,
  service: true,
  serviceDetails: true,
  client: { select: { name: true, address: true, company: true, phone: true } },
} as const;

type InvoiceWithRelations = Invoice & {
  project: Pick<Project, "title" | "service" | "serviceDetails"> & {
    client: Pick<Client, "name" | "address" | "company" | "phone">;
  };
};

/** Converte uma factura do Prisma no formato usado pelas tabelas e pelo PDF. */
export function toInvoiceRow(invoice: InvoiceWithRelations): InvoiceRow {
  return {
    id: invoice.id,
    number: invoice.number,
    projectId: invoice.projectId,
    amount: Number(invoice.amount),
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paymentMethod: invoice.paymentMethod,
    notes: invoice.notes,
    settlesProject: invoice.settlesProject,
    accountId: invoice.accountId,
    paidAt: invoice.paidAt,
    createdAt: invoice.createdAt,
    installment: invoice.installment,
    recurringCycle: invoice.recurringCycle,
    projectTotal: invoice.projectTotal === null ? null : Number(invoice.projectTotal),
    previouslyInvoiced: invoice.previouslyInvoiced === null ? null : Number(invoice.previouslyInvoiced),
    remaining: invoice.remaining === null ? null : Number(invoice.remaining),
    project: {
      title: invoice.project.title,
      service: invoice.project.service,
      details: parseServiceDetails(invoice.project.serviceDetails),
      client: {
        name: invoice.project.client.name,
        telefone: invoice.project.client.phone || "",
        adress: invoice.project.client.address || "",
        company: invoice.project.client.company || "",
      },
    },
  };
}

export function isInvoiceOverdue(invoice: { status: string; dueDate: Date | string }) {
  return (
    invoice.status === "VENCIDA" ||
    (invoice.status === "PENDENTE" && new Date(invoice.dueDate) < new Date())
  );
}

/** Totais (em Kz) de um conjunto de facturas. Canceladas não contam. */
export function summarizeInvoices(invoices: { amount: number; status: string }[]) {
  let invoiced = 0;
  let received = 0;
  let outstanding = 0;

  invoices.forEach((inv) => {
    if (inv.status === "CANCELADA") return;
    invoiced += inv.amount;
    if (inv.status === "PAGA") received += inv.amount;
    else outstanding += inv.amount;
  });

  return { invoiced, received, outstanding };
}
