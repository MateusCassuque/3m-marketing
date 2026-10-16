"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const statusSchema = z.enum(["NOVO", "EM_CONTATO", "QUALIFICADO", "GANHO", "PERDIDO"]);

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
}

export async function updateLeadStatus(id: string, status: string) {
  await requireAdmin();
  const parsed = statusSchema.parse(status);

  await prisma.lead.update({ where: { id }, data: { status: parsed } });
  refresh();
}

export async function saveLeadNotes(id: string, notes: string) {
  await requireAdmin();
  const clean = z.string().max(2000).parse(notes).trim();

  await prisma.lead.update({ where: { id }, data: { notes: clean.length ? clean : null } });
  refresh();
}

export async function deleteLead(id: string) {
  await requireAdmin();
  await prisma.lead.delete({ where: { id } });
  refresh();
}

/**
 * Transforma um lead em cliente. Se já existir um cliente com o mesmo e-mail,
 * reutiliza-o em vez de criar um duplicado. O lead passa a "Ganho".
 */
export async function convertLeadToClient(id: string) {
  await requireAdmin();

  const lead = await prisma.lead.findUniqueOrThrow({ where: { id } });
  const existing = await prisma.client.findFirst({ where: { email: lead.email } });

  const client =
    existing ??
    (await prisma.client.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        notes: `Origem: formulário do site.\n\n${lead.message}`.slice(0, 2000),
      },
    }));

  await prisma.lead.update({ where: { id }, data: { status: "GANHO" } });

  refresh();
  revalidatePath("/admin/clientes");

  return { clientId: client.id, created: !existing };
}
