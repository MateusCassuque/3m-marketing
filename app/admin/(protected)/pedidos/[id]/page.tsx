import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { INVOICE_PROJECT_SELECT, toInvoiceRow, summarizeInvoices } from "@/lib/invoice-rows";
import {
  PRIORITY_BADGE,
  PRIORITY_LABELS,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_LABELS,
} from "@/lib/project-labels";
import { SERVICE_LABELS } from "@/lib/lead-labels";
import {
  APPLICANT_NOUN,
  hasServiceDetails,
  parseServiceDetails,
  passportKindLabel,
  visaTypeLabel,
} from "@/lib/service-details";
import { RECURRENCE_OPTIONS } from "@/lib/validations/project";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { BackLink, DefinitionRow, Section, Stat } from "@/components/admin/detalhe/bits";
import { EditProjectButton, NewInvoiceButton } from "@/components/admin/detalhe/detail-actions";
import { getAccountOptions } from "@/lib/accounts";
import { InvoiceList } from "@/components/admin/detalhe/invoice-list";

export const metadata: Metadata = {
  title: "Pedido | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project, clients, accounts] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        invoices: {
          include: {
            project: { select: INVOICE_PROJECT_SELECT },
          },
          orderBy: { issueDate: "desc" },
        },
      },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    getAccountOptions(),
  ]);
  if (!project) notFound();

  const invoiceRows = project.invoices.map(toInvoiceRow);
  const totals = summarizeInvoices(invoiceRows);
  const value = Number(project.value);
  const toInvoice = Math.max(value - totals.invoiced, 0);
  const recurring = project.billingType === "RECORRENTE";
  const serviceDetails = parseServiceDetails(project.serviceDetails);
  const detailService = hasServiceDetails(project.service) ? project.service : null;
  const recurrenceLabel = RECURRENCE_OPTIONS.find((o) => o.value === project.recurrenceMonths)?.label ?? "";

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <BackLink href="/admin/pedidos">Voltar aos pedidos</BackLink>

      <PageHeader title={project.title} description={`${SERVICE_LABELS[project.service]} · criado a ${formatDateNotTime(project.createdAt)}`}>
        <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
        <Badge variant={PRIORITY_BADGE[project.priority]}>Prioridade {PRIORITY_LABELS[project.priority].toLowerCase()}</Badge>
        <NewInvoiceButton
          clients={clients}
          accounts={accounts}
          project={{
            id: project.id,
            title: project.title,
            value,
            client: { name: project.client.name },
            recurring: project.billingType === "RECORRENTE",
            status: project.status,
            invoices: project.invoices
              .filter((inv) => inv.status !== "CANCELADA")
              .map((inv) => ({ id: inv.id, amount: Number(inv.amount), createdAt: inv.createdAt.toISOString() })),
          }}
        />
        <EditProjectButton
          clients={clients}
          project={{
            id: project.id,
            title: project.title,
            description: project.description,
            clientId: project.clientId,
            service: project.service,
            status: project.status,
            priority: project.priority,
            value,
            startDate: project.startDate,
            dueDate: project.dueDate,
            billingType: project.billingType,
            recurrenceMonths: project.recurrenceMonths,
            nextBillingDate: project.nextBillingDate,
            recurrenceEndDate: project.recurrenceEndDate,
            paymentTermDays: project.paymentTermDays,
            serviceDetails,
          }}
        />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label={recurring ? "Valor de cada cobrança" : "Valor do pedido"} value={formatCurrency(value)} />
        <Stat label="Facturado" value={formatCurrency(totals.invoiced)} />
        <Stat label="Recebido" value={formatCurrency(totals.received)} tone="success" />
        {recurring ? (
          <Stat label="Por receber" value={formatCurrency(totals.outstanding)} tone={totals.outstanding > 0 ? "warning" : "default"} />
        ) : (
          <Stat label="Por facturar" value={formatCurrency(toInvoice)} tone={toInvoice > 0 ? "warning" : "default"} />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
        <Section title="Detalhes do pedido">
          <dl className="divide-y divide-border px-6 py-2">
            <DefinitionRow label="Cliente">
              <Link href={`/admin/clientes/${project.clientId}`} className="text-primary-700 hover:underline">
                {project.client.name}
              </Link>
            </DefinitionRow>
            <DefinitionRow label="Serviço">{SERVICE_LABELS[project.service]}</DefinitionRow>
            <DefinitionRow label="Início">{project.startDate ? formatDateNotTime(project.startDate) : "—"}</DefinitionRow>
            <DefinitionRow label="Entrega">{project.dueDate ? formatDateNotTime(project.dueDate) : "—"}</DefinitionRow>
            {serviceDetails && !serviceDetails.forClient && serviceDetails.unitValue !== undefined && serviceDetails.applicants.length > 1 && (
              <DefinitionRow label="Valor por pessoa">
                {formatCurrency(serviceDetails.unitValue)} × {serviceDetails.applicants.length}
              </DefinitionRow>
            )}
            <DefinitionRow label="Cobrança">
              {recurring ? `Recorrente · ${recurrenceLabel.toLowerCase()}` : "Única"}
            </DefinitionRow>
            {recurring && (
              <>
                <DefinitionRow label="Próxima cobrança">
                  {project.nextBillingDate ? formatDateNotTime(project.nextBillingDate) : "Terminada"}
                </DefinitionRow>
                <DefinitionRow label="Prazo de pagamento">{project.paymentTermDays} dias</DefinitionRow>
                {project.recurrenceEndDate && (
                  <DefinitionRow label="Termina em">{formatDateNotTime(project.recurrenceEndDate)}</DefinitionRow>
                )}
              </>
            )}
          </dl>
          {project.description && (
            <div className="border-t border-border px-6 py-4">
              <p className="text-xs font-semibold text-muted-foreground">Descrição</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">{project.description}</p>
            </div>
          )}
        </Section>

        {detailService && serviceDetails && (
          <Section title={`Detalhes — ${SERVICE_LABELS[detailService].toLowerCase()}`}>
            <dl className="divide-y divide-border px-6 py-2">
              {detailService === "ASSESSORIA_VISTO" && (
                <>
                  <DefinitionRow label="País de destino">{serviceDetails.country || "—"}</DefinitionRow>
                  <DefinitionRow label="Tipo de visto">{visaTypeLabel(serviceDetails.visaType)}</DefinitionRow>
                </>
              )}
              {detailService === "ASSESSORIA_PASSAPORTE" && (
                <DefinitionRow label="Tipo de pedido">{passportKindLabel(serviceDetails.passportKind)}</DefinitionRow>
              )}
              {detailService === "BILHETES" && (
                <>
                  <DefinitionRow label="Trajecto">
                    {serviceDetails.origin || "—"} → {serviceDetails.destination || "—"}
                  </DefinitionRow>
                  <DefinitionRow label="Ida">{serviceDetails.departDate ? formatDateNotTime(serviceDetails.departDate) : "—"}</DefinitionRow>
                  <DefinitionRow label="Volta">{serviceDetails.returnDate ? formatDateNotTime(serviceDetails.returnDate) : "—"}</DefinitionRow>
                </>
              )}
            </dl>
            <div className="border-t border-border px-6 py-4">
              <p className="text-xs font-semibold text-muted-foreground">
                {serviceDetails.forClient ? "Para o próprio cliente" : `Para outras pessoas (${serviceDetails.applicants.length})`}
              </p>
              <ul className="mt-2 divide-y divide-border">
                {serviceDetails.applicants.map((person, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 py-2 text-sm">
                    <span className="font-medium text-navy-700">{person.name || `${APPLICANT_NOUN[detailService].one} ${i + 1}`}</span>
                    <span className="text-muted-foreground">
                      {person.passportNumber ? `Passaporte ${person.passportNumber}` : "Sem n.º de passaporte"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}
        </div>

        <Section title="Facturas deste pedido" count={invoiceRows.length}>
          <InvoiceList invoices={invoiceRows} emptyText="Este pedido ainda não tem facturas." />
        </Section>
      </div>
    </div>
  );
}
