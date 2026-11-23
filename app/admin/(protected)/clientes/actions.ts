"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { broadcastNotificationsChanged } from "@/lib/realtime";
import { clientSchema, type ClientValues } from "@/lib/validations/client";

function clean(value?: string) {
  return value && value.length > 0 ? value : null;
}

export async function createClient(values: ClientValues) {
  await requireAdmin();
  const parsed = clientSchema.parse(values);

  const client = await prisma.client.create({
    data: {
      name: parsed.name,
      email: clean(parsed.email),
      phone: clean(parsed.phone),
      company: clean(parsed.company),
      taxId: clean(parsed.taxId),
      address: clean(parsed.address),
      notes: clean(parsed.notes),
    },
  });

  revalidatePath("/admin/clientes");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/faturas");
  revalidatePath("/admin/clientes/[id]", "page");
  revalidatePath("/admin/pedidos/[id]", "page");

  // Devolve o cliente criado para os formulários poderem seleccioná-lo logo.
  return client;
}

export async function updateClient(id: string, values: ClientValues) {
  await requireAdmin();
  const parsed = clientSchema.parse(values);

  await prisma.client.update({
    where: { id },
    data: {
      name: parsed.name,
      email: clean(parsed.email),
      phone: clean(parsed.phone),
      company: clean(parsed.company),
      taxId: clean(parsed.taxId),
      address: clean(parsed.address),
      notes: clean(parsed.notes),
    },
  });

  revalidatePath("/admin/clientes");
  revalidatePath("/admin/clientes/[id]", "page");
  revalidatePath("/admin/pedidos/[id]", "page");
  broadcastNotificationsChanged();
}

export async function deleteClient(id: string) {
  await requireAdmin();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/clientes/[id]", "page");
  revalidatePath("/admin/pedidos/[id]", "page");
  broadcastNotificationsChanged();
}
