"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { parseDateOrNull } from "@/lib/serialize"
import { invoiceSchema, type InvoiceValues } from "@/lib/validations/invoice"

export async function createInvoice(values: InvoiceValues) {
  await requireAdmin()
  const parsed = invoiceSchema.parse(values)

  await prisma.$transaction(async (tx) => {
    const count = await tx.invoice.count()
    const number = `FAT-${String(count + 1).padStart(4, "0")}`

    await tx.invoice.create({
      data: {
        number,
        projectId: parsed.projectId,
        amount: parsed.amount,
        status: parsed.status,
        issueDate: parseDateOrNull(parsed.issueDate) ?? new Date(),
        dueDate: parseDateOrNull(parsed.dueDate) ?? new Date(),
        paymentMethod: parsed.paymentMethod || null,
        notes: parsed.notes || null,
        paidAt: parsed.status === "PAGA" ? new Date() : null,
      },
    })
  })

  revalidatePath("/admin/faturas")
  revalidatePath("/admin/financeiro")
}

export async function updateInvoice(id: string, values: InvoiceValues) {
  await requireAdmin()
  const parsed = invoiceSchema.parse(values)

  const existing = await prisma.invoice.findUnique({ where: { id }, select: { status: true } })
  const justPaid = parsed.status === "PAGA" && existing?.status !== "PAGA"
  const unpaid = parsed.status !== "PAGA" && existing?.status === "PAGA"

  await prisma.invoice.update({
    where: { id },
    data: {
      projectId: parsed.projectId,
      amount: parsed.amount,
      status: parsed.status,
      issueDate: parseDateOrNull(parsed.issueDate) ?? new Date(),
      dueDate: parseDateOrNull(parsed.dueDate) ?? new Date(),
      paymentMethod: parsed.paymentMethod || null,
      notes: parsed.notes || null,
      ...(justPaid ? { paidAt: new Date() } : {}),
      ...(unpaid ? { paidAt: null } : {}),
    },
  })

  revalidatePath("/admin/faturas")
  revalidatePath("/admin/financeiro")
}

export async function deleteInvoice(id: string) {
  await requireAdmin()
  await prisma.invoice.delete({ where: { id } })
  revalidatePath("/admin/faturas")
  revalidatePath("/admin/financeiro")
}
