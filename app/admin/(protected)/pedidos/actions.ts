"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { recomputeProjectInvoices } from "@/lib/invoice-balance-server";
import { broadcastNotificationsChanged } from "@/lib/realtime";
import { runRecurringBilling } from "@/lib/recurring-billing";
import { hasServiceDetails } from "@/lib/service-details";
import { parseDateOrNull } from "@/lib/serialize";
import { projectSchema, type ProjectValues } from "@/lib/validations/project";

/** Converte os valores do formulário nos campos da base de dados (detalhes do serviço e recorrência). */
async function buildProjectData(parsed: ProjectValues) {
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: parsed.clientId },
    select: { name: true },
  });

  // Detalhes de visto / passaporte / bilhetes. "Para o cliente" usa o nome do próprio cliente.
  let details: Prisma.InputJsonValue | typeof Prisma.DbNull = Prisma.DbNull;
  if (hasServiceDetails(parsed.service)) {
    const d = parsed.serviceDetails;
    const applicants = d.forClient
      ? [{ name: client.name, passportNumber: d.applicants[0]?.passportNumber?.trim() ?? "" }]
      : d.applicants
          .map((p) => ({ name: p.name.trim(), passportNumber: p.passportNumber.trim() }))
          .filter((p) => p.name);

    details = {
      forClient: d.forClient,
      applicants,
      country: parsed.service === "ASSESSORIA_VISTO" ? d.country : "",
      visaType: parsed.service === "ASSESSORIA_VISTO" ? d.visaType : "",
      passportKind: parsed.service === "ASSESSORIA_PASSAPORTE" ? d.passportKind : "",
      origin: parsed.service === "BILHETES" ? d.origin : "",
      destination: parsed.service === "BILHETES" ? d.destination : "",
      departDate: parsed.service === "BILHETES" ? d.departDate : "",
      returnDate: parsed.service === "BILHETES" ? d.returnDate : "",
    };
  }

  const recurring = parsed.billingType === "RECORRENTE";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    title: parsed.title,
    description: parsed.description || null,
    clientId: parsed.clientId,
    service: parsed.service,
    status: parsed.status,
    priority: parsed.priority,
    value: parsed.value,
    startDate: parseDateOrNull(parsed.startDate),
    dueDate: parseDateOrNull(parsed.dueDate),
    serviceDetails: details,
    billingType: parsed.billingType,
    recurrenceMonths: recurring ? parsed.recurrenceMonths : null,
    nextBillingDate: recurring ? (parseDateOrNull(parsed.nextBillingDate) ?? today) : null,
    recurrenceEndDate: recurring ? parseDateOrNull(parsed.recurrenceEndDate) : null,
    paymentTermDays: parsed.paymentTermDays,
  };
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/faturas");
  revalidatePath("/admin/clientes/[id]", "page");
  revalidatePath("/admin/pedidos/[id]", "page");
  revalidatePath("/admin/financeiro");
  broadcastNotificationsChanged();
}

export async function createProject(values: ProjectValues) {
  await requireAdmin();
  const parsed = projectSchema.parse(values);
  const data = await buildProjectData(parsed);

  const project = await prisma.project.create({
    data: { ...data, completedAt: parsed.status === "CONCLUIDO" ? new Date() : null },
    select: { id: true },
  });

  // Projecto recorrente com a primeira cobrança já a vencer: emite a factura logo.
  if (data.billingType === "RECORRENTE") await runRecurringBilling({ projectId: project.id });

  refresh();
}

export async function updateProject(id: string, values: ProjectValues) {
  await requireAdmin();
  const parsed = projectSchema.parse(values);
  const data = await buildProjectData(parsed);

  const existing = await prisma.project.findUnique({ where: { id }, select: { status: true } });
  const justCompleted = parsed.status === "CONCLUIDO" && existing?.status !== "CONCLUIDO";

  // O valor do pedido pode ter mudado: recalcula o "em falta" das facturas dele.
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: { ...data, ...(justCompleted ? { completedAt: new Date() } : {}) },
    });
    await recomputeProjectInvoices(tx, id);
  });

  if (data.billingType === "RECORRENTE") await runRecurringBilling({ projectId: id });

  refresh();
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
