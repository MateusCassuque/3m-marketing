import type { Metadata } from "next";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { firstParam, paginate, parsePage } from "@/lib/pagination";
import { PageHeader } from "@/components/admin/page-header";
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

  const where: Prisma.InvoiceWhereInput = q
    ? {
        OR: [
          { number: { contains: q, mode: "insensitive" } },
          { project: { title: { contains: q, mode: "insensitive" } } },
          { project: { client: { name: { contains: q, mode: "insensitive" } } } },
        ],
      }
    : {};

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
      include: { client: { select: { name: true } } },
      orderBy: { title: "asc" },
    }),
  ]);

  const invoiceRows: InvoiceRow[] = invoices.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    projectId: invoice.projectId,
    amount: Number(invoice.amount),
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paymentMethod: invoice.paymentMethod,
    notes: invoice.notes,
    project: {
      title: invoice.project.title, client: {
        name: invoice.project.client.name,
        telefone: invoice.project.client.phone || '',
        adress: invoice.project.client.address || '',
        company: invoice.project.client.company || '',
      }
    },
  }));

  const projectOptions: ProjectOption[] = projects.map((project) => ({
    id: project.id,
    title: project.title,
    value: Number(project.value),
    client: { name: project.client.name },
  }));

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader title="Facturas" description="Emita e acompanhe as facturas de cada pedido." />
      <InvoicesTable
        invoices={invoiceRows}
        projects={projectOptions}
        q={q}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
