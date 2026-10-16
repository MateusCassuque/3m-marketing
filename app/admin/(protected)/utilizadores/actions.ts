"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/require-admin";

const passwordSchema = z
  .string()
  .min(10, "A senha deve ter pelo menos 10 caracteres.")
  .max(100, "Senha demasiado longa.");

const createSchema = z.object({
  name: z.string().trim().min(2, "Indique o nome.").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: passwordSchema,
  role: z.enum(["ADMIN", "EDITOR"]),
});

export async function createUser(values: z.infer<typeof createSchema>) {
  await requireAdmin();
  const parsed = createSchema.parse(values);

  const exists = await prisma.admin.findUnique({ where: { email: parsed.email } });
  if (exists) throw new Error("Já existe uma conta com este e-mail.");

  await prisma.admin.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      passwordHash: await hashPassword(parsed.password),
    },
  });
  revalidatePath("/admin/utilizadores");
}

export async function resetUserPassword(id: string, password: string) {
  await requireAdmin();
  const parsed = passwordSchema.parse(password);

  await prisma.admin.update({ where: { id }, data: { passwordHash: await hashPassword(parsed) } });
  revalidatePath("/admin/utilizadores");
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (me.id === id) throw new Error("Não pode eliminar a sua própria conta.");

  const target = await prisma.admin.findUniqueOrThrow({ where: { id } });
  if (target.role === "ADMIN") {
    const admins = await prisma.admin.count({ where: { role: "ADMIN" } });
    if (admins <= 1) throw new Error("É necessário manter pelo menos um administrador.");
  }

  await prisma.admin.delete({ where: { id } });
  revalidatePath("/admin/utilizadores");
}
