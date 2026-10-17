import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { firstParam, paginate, parsePage } from "@/lib/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { ClientsTable } from "@/components/admin/clientes/clients-table";

export const metadata: Metadata = {
  title: "Clientes | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = firstParam(params.q).trim();

  const where: Prisma.ClientWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { company: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const total = await prisma.client.count({ where });
  const { page, totalPages, skip, take } = paginate(total, parsePage(params.page));

  const clients = await prisma.client.findMany({
    where,
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader title="Clientes" description="Registe e gira os clientes associados a pedidos e facturas." />
      <ClientsTable clients={clients} q={q} page={page} totalPages={totalPages} total={total} />
    </div>
  );
}
