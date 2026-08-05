import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { ProjectsTable, type ProjectRow } from "@/components/admin/pedidos/projects-table";

export const metadata: Metadata = {
  title: "Pedidos | Painel 3M",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
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
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Pedidos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe os projetos em andamento e o valor de cada pedido.
        </p>
      </div>

      <ProjectsTable projects={rows} clients={clients} />
    </div>
  );
}
