import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarClock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { toInvoiceRow, summarizeInvoices } from "@/lib/invoice-rows";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABELS } from "@/lib/project-labels";
import { SERVICE_LABELS } from "@/lib/lead-labels";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { BackLink, DefinitionRow, Section, Stat } from "@/components/admin/detalhe/bits";
import { EditClientButton } from "@/components/admin/detalhe/detail-actions";
import { InvoiceList } from "@/components/admin/detalhe/invoice-list";

export const metadata: Metadata = {
  title: "Cliente | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!client) notFound();

  const invoices = await prisma.invoice.findMany({
    where: { project: { clientId: id } },
    include: {
      project: {
        select: {
          title: true,
          client: { select: { name: true, address: true, company: true, phone: true } },
        },
      },
    },
    orderBy: { issueDate: "desc" },
  });

  const invoiceRows = invoices.map(toInvoiceRow);
  const totals = summarizeInvoices(invoiceRows);
  const projectsValue = client.projects
    .filter((p) => p.status !== "CANCELADO")
    .reduce((sum, p) => sum + Number(p.value), 0);

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <BackLink href="/admin/clientes">Voltar aos clientes</BackLink>

      <PageHeader
        title={client.name}
        description={client.company ? `${client.company} · cliente desde ${formatDateNotTime(client.createdAt)}` : `Cliente desde ${formatDateNotTime(client.createdAt)}`}
      >
        <EditClientButton client={client} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Pedidos" value={client.projects.length} />
        <Stat label="Facturado" value={formatCurrency(totals.invoiced)} />
        <Stat label="Recebido" value={formatCurrency(totals.received)} tone="success" />
        <Stat label="Por receber" value={formatCurrency(totals.outstanding)} tone={totals.outstanding > 0 ? "warning" : "default"} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Section title="Dados do cliente">
            <dl className="divide-y divide-border px-6 py-2">
              <DefinitionRow label="E-mail">
                <a href={`mailto:${client.email}`} className="break-all text-primary-700 hover:underline">
                  {client.email}
                </a>
              </DefinitionRow>
              <DefinitionRow label="Telefone">
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="text-primary-700 hover:underline">
                    {client.phone}
                  </a>
                ) : (
                  "—"
                )}
              </DefinitionRow>
              <DefinitionRow label="Empresa">
                {client.company ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {client.company}
                  </span>
                ) : (
                  "—"
                )}
              </DefinitionRow>
              <DefinitionRow label="NIF">{client.taxId || "—"}</DefinitionRow>
              <DefinitionRow label="Morada">{client.address || "—"}</DefinitionRow>
            </dl>
            {client.notes && (
              <div className="border-t border-border px-6 py-4">
                <p className="text-xs font-semibold text-muted-foreground">Notas</p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">{client.notes}</p>
              </div>
            )}
          </Section>

          <p className="px-1 text-xs text-muted-foreground">
            Valor total dos pedidos (sem cancelados): <strong className="text-navy-700">{formatCurrency(projectsValue)}</strong>
          </p>
        </div>

        <div className="space-y-6">
          <Section title="Pedidos" count={client.projects.length}>
            {client.projects.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">Este cliente ainda não tem pedidos.</p>
            ) : (
              <ul className="divide-y divide-border">
                {client.projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/admin/pedidos/${project.id}`}
                      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 transition-colors hover:bg-primary-50/40"
                    >
                      <div className="min-w-0">
                        <p className="font-display font-bold text-navy-700">{project.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          {SERVICE_LABELS[project.service]}
                          {project.dueDate && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Entrega {formatDateNotTime(project.dueDate)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
                        <span className="min-w-[110px] text-right font-display font-bold text-navy-700">
                          {formatCurrency(Number(project.value))}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Facturas" count={invoiceRows.length}>
            <InvoiceList invoices={invoiceRows} showProject emptyText="Este cliente ainda não tem facturas." />
          </Section>
        </div>
      </div>
    </div>
  );
}
