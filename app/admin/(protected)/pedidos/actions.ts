"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { recomputeProjectInvoices } from "@/lib/invoice-balance-server";
import { broadcastNotificationsChanged } from "@/lib/realtime";
import { parseDateOrNull } from "@/lib/serialize";
import { projectSchema, type ProjectValues } from "@/lib/validations/project";

export async function createProject(values: ProjectValues) {
  await requireAdmin();
  const parsed = projectSchema.parse(values);

  await prisma.project.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      clientId: parsed.clientId,
      service: parsed.service,
      status: parsed.status,
      priority: parsed.priority,
      value: parsed.value,
      startDate: parseDateOrNull(parsed.startDate),
      dueDate: parseDateOrNull(parsed.dueDate),
      completedAt: parsed.status === "CONCLUIDO" ? new Date() : null,
    },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/clientes/[id]", "page");
  revalidatePath("/admin/pedidos/[id]", "page");
  broadcastNotificationsChanged();
  revalidatePath("/admin/financeiro");
}

export async function updateProject(id: string, values: ProjectValues) {
  await requireAdmin();
  const parsed = projectSchema.parse(values);

  const existing = await prisma.project.findUnique({ where: { id }, select: { status: true } });
  const justCompleted = parsed.status === "CONCLUIDO" && existing?.status !== "CONCLUIDO";

  // O valor do pedido pode ter mudado: recalcula o "em falta" das facturas dele.
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description || null,
        clientId: parsed.clientId,
        service: parsed.service,
        status: parsed.status,
        priority: parsed.priority,
        value: parsed.value,
        startDate: parseDateOrNull(parsed.startDate),
        dueDate: parseDateOrNull(parsed.dueDate),
        ...(justCompleted ? { completedAt: new Date() } : {}),
      },
    });


    await recomputeProjectInvoices(tx, id);
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/clientes/[id]", "page");
  revalidatePath("/admin/pedidos/[id]", "page");
  broadcastNotificationsChanged();
  revalidatePath("/admin/financeiro");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  // onDelete: Cascade no schema remove também as faturas desse pedido.
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/clientes/[id]", "page");
  revalidatePath("/admin/pedidos/[id]", "page");
  broadcastNotificationsChanged();
  revalidatePath("/admin/financeiro");
}
