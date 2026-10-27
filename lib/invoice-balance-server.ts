import type { Prisma } from "@prisma/client";

import { computeBalance, round2 } from "@/lib/invoice-balance";

/**
 * Recalcula, por ordem de criação, o número da parcela e o valor em falta de TODAS as
 * facturas de um pedido. Chama-se dentro da mesma transacção sempre que uma factura é
 * criada, editada (valor, estado, pedido), cancelada ou eliminada, e quando o valor do
 * pedido muda — assim as facturas seguintes nunca ficam com números desactualizados
 * (p. ex. ao eliminar a 1.ª parcela, a 2.ª passa a mostrar o que realmente falta).
 *
 * Facturas CANCELADAS não contam como facturado.
 */
export async function recomputeProjectInvoices(tx: Prisma.TransactionClient, projectId: string) {
  const project = await tx.project.findUnique({ where: { id: projectId }, select: { value: true } });
  if (!project) return;

  const invoices = await tx.invoice.findMany({
    where: { projectId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      amount: true,
      status: true,
      settlesProject: true,
      installment: true,
      projectTotal: true,
      previouslyInvoiced: true,
      remaining: true,
    },
  });

  const total = Number(project.value);
  let running = 0;
  let count = 0;

  for (const invoice of invoices) {
    const amount = Number(invoice.amount);
    const balance = computeBalance({
      total,
      previouslyInvoiced: running,
      amount,
      settles: invoice.settlesProject,
    });
    const installment = count + 1;

    const unchanged =
      invoice.installment === installment &&
      Number(invoice.projectTotal) === balance.total &&
      Number(invoice.previouslyInvoiced) === balance.previouslyInvoiced &&
      Number(invoice.remaining) === balance.remaining &&
      invoice.projectTotal !== null &&
      invoice.previouslyInvoiced !== null &&
      invoice.remaining !== null;

    if (!unchanged) {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          installment,
          projectTotal: balance.total,
          previouslyInvoiced: balance.previouslyInvoiced,
          remaining: balance.remaining,
        },
      });
    }

    if (invoice.status !== "CANCELADA") {
      running = round2(running + amount);
      count += 1;
    }
  }
}
