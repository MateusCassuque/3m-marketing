import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { InvoicesTable, type InvoiceRow } from "@/components/admin/faturas/invoices-table";
import type { ProjectOption } from "@/components/admin/faturas/invoice-form-dialog";

export const metadata: Metadata = {
  title: "Faturas | Painel 3M",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FaturasPage() {
  const [invoices, projects] = await Promise.all([
    prisma.invoice.findMany({
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
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Faturas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Emita e acompanhe as faturas de cada pedido.
        </p>
      </div>

      <InvoicesTable invoices={invoiceRows} projects={projectOptions} />
    </div>
  );
}
