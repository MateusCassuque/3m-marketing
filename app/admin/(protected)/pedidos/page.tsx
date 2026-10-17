import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { firstParam, paginate, parsePage } from "@/lib/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectsTable, type ProjectRow } from "@/components/admin/pedidos/projects-table";

export const metadata: Metadata = {
  title: "Pedidos | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = firstParam(params.q).trim();

  const where: Prisma.ProjectWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { client: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const total = await prisma.project.count({ where });
  const { page, totalPages, skip, take } = paginate(total, parsePage(params.page));

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: ProjectRow[] = projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    clientId: project.clientId,
    service: project.service,
    status: project.status,
    priority: project.priority,
    value: Number(project.value),
    startDate: project.startDate,
    dueDate: project.dueDate,
    client: { name: project.client.name },
  }));

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader title="Pedidos" description="Acompanhe os projectos em curso e o valor de cada pedido." />
      <ProjectsTable projects={rows} clients={clients} q={q} page={page} totalPages={totalPages} total={total} />
    </div>
  );
}
