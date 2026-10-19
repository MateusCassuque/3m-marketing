"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { parseDateOrNull } from "@/lib/serialize"
import { invoiceSchema, type InvoiceValues } from "@/lib/validations/invoice"

type Tx = Prisma.TransactionClient

/**
 * Próximo número de factura (FAT-0001, FAT-0002, …).
 *
 * Usa um contador que só avança: eliminar uma factura nunca "devolve" o número,
 * por isso não há colisões nem números repetidos. O incremento é atómico (uma
 * única instrução na base de dados), logo dois pedidos em simultâneo recebem
 * números diferentes. Se, por qualquer razão, o número já existir (p. ex. uma
 * factura criada à mão), salta para o seguinte livre.
 */
async function nextInvoiceNumber(tx: Tx): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const counter = await tx.invoiceCounter.upsert({
      where: { id: 1 },
      update: { lastNumber: { increment: 1 } },
      create: { id: 1, lastNumber: 1 },
    })

    const number = `FAT-${String(counter.lastNumber).padStart(4, "0")}`
    const taken = await tx.invoice.findUnique({ where: { number }, select: { id: true } })
    if (!taken) return number
  }

  throw new Error("Não foi possível gerar um número de factura livre.")
}

export async function createInvoice(values: InvoiceValues) {
  await requireAdmin()
  const parsed = invoiceSchema.parse(values)

  await prisma.$transaction(async (tx) => {
    const number = await nextInvoiceNumber(tx)

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
  revalidatePath("/admin")
  revalidatePath("/admin/clientes/[id]", "page")
  revalidatePath("/admin/pedidos/[id]", "page")
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
  revalidatePath("/admin")
  revalidatePath("/admin/clientes/[id]", "page")
  revalidatePath("/admin/pedidos/[id]", "page")
}

export async function deleteInvoice(id: string) {
  await requireAdmin()
  await prisma.invoice.delete({ where: { id } })
  revalidatePath("/admin/faturas")
  revalidatePath("/admin/financeiro")
  revalidatePath("/admin")
  revalidatePath("/admin/clientes/[id]", "page")
  revalidatePath("/admin/pedidos/[id]", "page")
}
