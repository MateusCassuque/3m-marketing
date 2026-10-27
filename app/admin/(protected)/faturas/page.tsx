import type { Metadata } from "next";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { toInvoiceRow } from "@/lib/invoice-rows";
import { firstParam, hasKey, paginate, parsePage } from "@/lib/pagination";
import { PageHeader } from "@/components/admin/page-header";
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

  const where: Prisma.InvoiceWhereInput = {
    AND: [searchWhere, estado ? ESTADOS[estado].where : {}],
  };

  const [totalAll, ...stateCounts] = await Promise.all([
    prisma.invoice.count(),
    ...Object.values(ESTADOS).map((e) => prisma.invoice.count({ where: e.where })),
  ]);
  const chips = [
    { value: "", label: "Todas", count: totalAll },
    ...Object.entries(ESTADOS).map(([value, e], i) => ({ value, label: e.label, count: stateCounts[i] })),
  ];

  const total = await prisma.invoice.count({ where });
  const { page, totalPages, skip, take } = paginate(total, parsePage(params.page));

  const [invoices, projects] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        project: {
          select: {
            title: true, client: {
              select: {
                name: true,
                address: true,
                company: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: { issueDate: "desc" },
      skip,
      take,
    }),
    prisma.project.findMany({
      include: {
        client: { select: { name: true } },
        invoices: {
          where: { status: { not: "CANCELADA" } },
          select: { id: true, amount: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const invoiceRows: InvoiceRow[] = invoices.map(toInvoiceRow);

  const projectOptions: ProjectOption[] = projects.map((project) => ({
    id: project.id,
    title: project.title,
    value: Number(project.value),
    client: { name: project.client.name },
    invoices: project.invoices.map((inv) => ({
      id: inv.id,
      amount: Number(inv.amount),
      createdAt: inv.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader title="Facturas" description="Emita e acompanhe as facturas de cada pedido." />
      <StatusChips basePath="/admin/faturas" chips={chips} current={estado} params={{ q }} />
      <InvoicesTable
        invoices={invoiceRows}
        projects={projectOptions}
        q={q}
        estado={estado}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
