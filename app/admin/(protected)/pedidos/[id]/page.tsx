import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { toInvoiceRow, summarizeInvoices } from "@/lib/invoice-rows";
import {
  PRIORITY_BADGE,
  PRIORITY_LABELS,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_LABELS,
} from "@/lib/project-labels";
import { SERVICE_LABELS } from "@/lib/lead-labels";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { BackLink, DefinitionRow, Section, Stat } from "@/components/admin/detalhe/bits";
import { EditProjectButton } from "@/components/admin/detalhe/detail-actions";
import { InvoiceList } from "@/components/admin/detalhe/invoice-list";

export const metadata: Metadata = {
  title: "Pedido | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project, clients] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        invoices: {
          include: {
            project: {
              select: {
                title: true,
                client: { select: { name: true, address: true, company: true, phone: true } },
              },
            },
          },
          orderBy: { issueDate: "desc" },
        },
      },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!project) notFound();

  const invoiceRows = project.invoices.map(toInvoiceRow);
  const totals = summarizeInvoices(invoiceRows);
  const value = Number(project.value);
  const toInvoice = Math.max(value - totals.invoiced, 0);

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <BackLink href="/admin/pedidos">Voltar aos pedidos</BackLink>

      <PageHeader title={project.title} description={`${SERVICE_LABELS[project.service]} · criado a ${formatDateNotTime(project.createdAt)}`}>
        <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
        <Badge variant={PRIORITY_BADGE[project.priority]}>Prioridade {PRIORITY_LABELS[project.priority].toLowerCase()}</Badge>
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
          }}
        />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Valor do pedido" value={formatCurrency(value)} />
        <Stat label="Facturado" value={formatCurrency(totals.invoiced)} />
        <Stat label="Recebido" value={formatCurrency(totals.received)} tone="success" />
        <Stat label="Por facturar" value={formatCurrency(toInvoice)} tone={toInvoice > 0 ? "warning" : "default"} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
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
          </dl>
          {project.description && (
            <div className="border-t border-border px-6 py-4">
              <p className="text-xs font-semibold text-muted-foreground">Descrição</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">{project.description}</p>
            </div>
          )}
        </Section>

        <Section title="Facturas deste pedido" count={invoiceRows.length}>
          <InvoiceList invoices={invoiceRows} emptyText="Este pedido ainda não tem facturas." />
        </Section>
      </div>
    </div>
  );
}
