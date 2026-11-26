import type { Metadata } from "next";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { INVOICE_PROJECT_SELECT, toInvoiceRow } from "@/lib/invoice-rows";
import { runRecurringBilling } from "@/lib/recurring-billing";
import { firstParam, hasKey, paginate, parsePage } from "@/lib/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { resolveRange, rangeWhere } from "@/lib/date-range";
import { getAccountOptions } from "@/lib/accounts";
import { PROJECT_OPTION_INCLUDE, toProjectOption } from "@/lib/project-options";
import { StatusChips } from "@/components/admin/status-chips";
import { InvoicesTable, type InvoiceRow } from "@/components/admin/faturas/invoices-table";
import type { ProjectOption } from "@/components/admin/faturas/invoice-form-dialog";

export const metadata: Metadata = {
  title: "Faturas | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Garante que as cobranças recorrentes já vencidas estão emitidas antes de listar.
  await runRecurringBilling().catch((error) => console.error("[faturas] facturação recorrente falhou", error));

  const params = await searchParams;
  const q = firstParam(params.q).trim();

  // Filtros por estado. "Vencidas" inclui as pendentes cuja data de vencimento já passou,
  // e "Pendentes" só as que ainda estão dentro do prazo — assim os números não se sobrepõem.
  const now = new Date();
  const ESTADOS: Record<string, { label: string; where: Prisma.InvoiceWhereInput }> = {
    pendente: { label: "Pendentes", where: { status: "PENDENTE", dueDate: { gte: now } } },
    vencida: {
      label: "Vencidas",
      where: { OR: [{ status: "VENCIDA" }, { status: "PENDENTE", dueDate: { lt: now } }] },
    },
    paga: { label: "Pagas", where: { status: "PAGA" } },
    cancelada: { label: "Canceladas", where: { status: "CANCELADA" } },
  };
  const rawEstado = firstParam(params.estado);
  const estado = hasKey(ESTADOS, rawEstado) ? rawEstado : "";

  const searchWhere: Prisma.InvoiceWhereInput = q
    ? {
        OR: [
          { number: { contains: q, mode: "insensitive" } },
          { project: { title: { contains: q, mode: "insensitive" } } },
          { project: { client: { name: { contains: q, mode: "insensitive" } } } },
        ],
      }
    : {};

  // Período (data de emissão): hoje, semana, mês, últimos N dias, ano ou calendário.
  const range = resolveRange(params, "tudo");
  const issueFilter = rangeWhere(range);
  const dateWhere: Prisma.InvoiceWhereInput = issueFilter ? { issueDate: issueFilter } : {};

  const where: Prisma.InvoiceWhereInput = {
    AND: [searchWhere, dateWhere, estado ? ESTADOS[estado].where : {}],
  };

  const [totalAll, ...stateCounts] = await Promise.all([
    prisma.invoice.count({ where: dateWhere }),
    ...Object.values(ESTADOS).map((e) => prisma.invoice.count({ where: { AND: [dateWhere, e.where] } })),
  ]);
  const chips = [
    { value: "", label: "Todas", count: totalAll },
    ...Object.entries(ESTADOS).map(([value, e], i) => ({ value, label: e.label, count: stateCounts[i] })),
  ];

  const total = await prisma.invoice.count({ where });
  const { page, totalPages, skip, take } = paginate(total, parsePage(params.page));

  const [invoices, projects, clients, accounts] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        project: { select: INVOICE_PROJECT_SELECT },
      },
      orderBy: { issueDate: "desc" },
      skip,
      take,
    }),
    prisma.project.findMany({ include: PROJECT_OPTION_INCLUDE, orderBy: { title: "asc" } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    getAccountOptions(),
  ]);

  const invoiceRows: InvoiceRow[] = invoices.map(toInvoiceRow);
  const projectOptions: ProjectOption[] = projects.map(toProjectOption);

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader title="Facturas" description="Emita e acompanhe as facturas de cada pedido." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StatusChips
          basePath="/admin/faturas"
          chips={chips}
          current={estado}
          params={{ q, ...range.params }}
          className="mb-0 min-w-0"
        />
        <DateRangeFilter current={range} className="shrink-0 self-auto lg:self-auto" />
      </div>
      <InvoicesTable
        invoices={invoiceRows}
        projects={projectOptions}
        clients={clients}
        accounts={accounts}
        q={q}
        estado={estado}
        range={range.params}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
