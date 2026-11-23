import type { Prisma } from "@prisma/client";

import type { ProjectOption } from "@/components/admin/faturas/invoice-form-dialog";

/** O que é preciso carregar de cada pedido para o poder escolher no formulário de factura. */
export const PROJECT_OPTION_INCLUDE = {
  client: { select: { name: true } },
  invoices: {
    where: { status: { not: "CANCELADA" } },
    select: { id: true, amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ProjectInclude;

export type ProjectWithOptionData = Prisma.ProjectGetPayload<{ include: typeof PROJECT_OPTION_INCLUDE }>;

export function toProjectOption(project: ProjectWithOptionData): ProjectOption {
  return {
    id: project.id,
    title: project.title,
    value: Number(project.value),
    client: { name: project.client.name },
    recurring: project.billingType === "RECORRENTE",
    status: project.status,
    invoices: project.invoices.map((inv) => ({
      id: inv.id,
      amount: Number(inv.amount),
      createdAt: inv.createdAt.toISOString(),
    })),
  };
}
