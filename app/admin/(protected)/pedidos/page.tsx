import type { Metadata } from "next";
import type { Prisma, ProjectStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { firstParam, hasKey, paginate, parsePage } from "@/lib/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { StatusChips } from "@/components/admin/status-chips";
import { PROJECT_STATUS_LABELS } from "@/lib/project-labels";
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

  const rawEstado = firstParam(params.estado);
  const estado = hasKey(PROJECT_STATUS_LABELS, rawEstado) ? (rawEstado as ProjectStatus) : "";

  const where: Prisma.ProjectWhereInput = {
    ...(estado ? { status: estado } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { client: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const total = await prisma.project.count({ where });
  const { page, totalPages, skip, take } = paginate(total, parsePage(params.page));

  const [projects, clients, grouped] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = new Map<string, number>(grouped.map((g) => [g.status, g._count._all]));
  const chips = [
    { value: "", label: "Todos", count: grouped.reduce((sum, g) => sum + g._count._all, 0) },
    ...(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((status) => ({
      value: status,
      label: PROJECT_STATUS_LABELS[status],
      count: counts.get(status) ?? 0,
    })),
  ];

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
      <StatusChips basePath="/admin/pedidos" chips={chips} current={estado} params={{ q }} />
      <ProjectsTable projects={rows} clients={clients} q={q} estado={estado} page={page} totalPages={totalPages} total={total} />
    </div>
  );
}
