"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { recomputeProjectInvoices } from "@/lib/invoice-balance-server"
import { nextInvoiceNumber } from "@/lib/invoice-number"
import { advanceProjectAfterPayment } from "@/lib/project-status-automation"
import { broadcastNotificationsChanged } from "@/lib/realtime"
import { parseDateOrNull } from "@/lib/serialize"
import { invoiceSchema, type InvoiceValues } from "@/lib/validations/invoice"

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
        settlesProject: parsed.settlesProject,
      },
    })

    // Calcula a parcela e o valor em falta (e ajusta as restantes facturas do pedido).
    await recomputeProjectInvoices(tx, parsed.projectId)

    // Factura já criada como paga: o pedido avança de fase sozinho.
    if (parsed.status === "PAGA") await advanceProjectAfterPayment(tx, parsed.projectId)
  })

  revalidatePath("/admin/pedidos")
  revalidatePath("/admin/faturas")
  revalidatePath("/admin/financeiro")
  revalidatePath("/admin")
  revalidatePath("/admin/clientes/[id]", "page")
  revalidatePath("/admin/pedidos/[id]", "page")
  broadcastNotificationsChanged()
}

export async function updateInvoice(id: string, values: InvoiceValues) {
  await requireAdmin()
  const parsed = invoiceSchema.parse(values)

  const existing = await prisma.invoice.findUnique({
    where: { id },
    select: { status: true, projectId: true },
  })
  const justPaid = parsed.status === "PAGA" && existing?.status !== "PAGA"
  const unpaid = parsed.status !== "PAGA" && existing?.status === "PAGA"

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id },
      data: {
      projectId: parsed.projectId,
      amount: parsed.amount,
      status: parsed.status,
      issueDate: parseDateOrNull(parsed.issueDate) ?? new Date(),
      dueDate: parseDateOrNull(parsed.dueDate) ?? new Date(),
      paymentMethod: parsed.paymentMethod || null,
      notes: parsed.notes || null,
      settlesProject: parsed.settlesProject,
      ...(justPaid ? { paidAt: new Date() } : {}),
      ...(unpaid ? { paidAt: null } : {}),
    },
    })

    await recomputeProjectInvoices(tx, parsed.projectId)
    // Se a factura mudou de pedido, o pedido antigo também precisa de ser recalculado.
    if (existing && existing.projectId !== parsed.projectId) {
      await recomputeProjectInvoices(tx, existing.projectId)
    }

    // Acabou de ser marcada como paga (ou passou a pertencer a outro pedido já pago).
    if (parsed.status === "PAGA" && (justPaid || (existing && existing.projectId !== parsed.projectId))) {
      await advanceProjectAfterPayment(tx, parsed.projectId)
    }
  })

  revalidatePath("/admin/pedidos")
  revalidatePath("/admin/faturas")
  revalidatePath("/admin/financeiro")
  revalidatePath("/admin")
  revalidatePath("/admin/clientes/[id]", "page")
  revalidatePath("/admin/pedidos/[id]", "page")
  broadcastNotificationsChanged()
}

export async function deleteInvoice(id: string) {
  await requireAdmin()
  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.delete({ where: { id }, select: { projectId: true } })
    await recomputeProjectInvoices(tx, invoice.projectId)
  })
  revalidatePath("/admin/faturas")
  revalidatePath("/admin/financeiro")
  revalidatePath("/admin")
  revalidatePath("/admin/clientes/[id]", "page")
  revalidatePath("/admin/pedidos/[id]", "page")
  broadcastNotificationsChanged()
}
