"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
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
  revalidatePath("/admin/financeiro");
}

export async function updateProject(id: string, values: ProjectValues) {
  await requireAdmin();
  const parsed = projectSchema.parse(values);

  const existing = await prisma.project.findUnique({ where: { id }, select: { status: true } });
  const justCompleted = parsed.status === "CONCLUIDO" && existing?.status !== "CONCLUIDO";

  await prisma.project.update({
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

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/financeiro");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  // onDelete: Cascade no schema remove também as faturas desse pedido.
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/financeiro");
}
