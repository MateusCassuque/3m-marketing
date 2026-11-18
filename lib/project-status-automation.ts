import type { Prisma } from "@prisma/client";

import { round2 } from "@/lib/invoice-balance";

/**
 * Avança o estado do pedido quando uma factura é paga, para não depender de ninguém se lembrar:
 *
 *  - 1.º pagamento  →  "Backlog" passa a "Em andamento" (o trabalho pode começar);
 *  - última factura paga  →  "Em andamento" passa a "Em revisão".
 *
 * "Última factura paga" = o pedido já está todo facturado (a soma das facturas chega ao valor do pedido,
 * ou uma factura foi marcada como "fecha o pedido") e não há nenhuma factura por pagar.
 *
 * Regras de segurança:
 *  - só avança, nunca recua (desmarcar um pagamento não volta atrás — corrija o estado à mão se preciso);
 *  - cada pagamento faz no máximo um passo (se a única factura cobre tudo, o pedido fica "Em andamento");
 *  - não mexe em pedidos concluídos, cancelados ou já em revisão;
 *  - pedidos de cobrança recorrente só passam a "Em andamento" (não têm "última factura").
 *
 * Devolve o novo estado, ou null se nada mudou. Deve correr dentro da transacção do pagamento.
 */
export async function advanceProjectAfterPayment(
  tx: Prisma.TransactionClient,
  projectId: string,
): Promise<"EM_ANDAMENTO" | "EM_REVISAO" | null> {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      status: true,
      value: true,
      billingType: true,
      invoices: {
        where: { status: { not: "CANCELADA" } },
        select: { amount: true, status: true, settlesProject: true },
      },
    },
  });
  if (!project) return null;

  if (project.status === "BACKLOG") {
    await tx.project.update({ where: { id: projectId }, data: { status: "EM_ANDAMENTO" } });
    return "EM_ANDAMENTO";
  }

  if (project.status === "EM_ANDAMENTO" && project.billingType === "UNICO") {
    const invoices = project.invoices;
    const invoiced = round2(invoices.reduce((sum, inv) => sum + Number(inv.amount), 0));
    const fullyInvoiced = invoices.some((inv) => inv.settlesProject) || invoiced >= Number(project.value);
    const allPaid = invoices.length > 0 && invoices.every((inv) => inv.status === "PAGA");

    if (fullyInvoiced && allPaid) {
      await tx.project.update({ where: { id: projectId }, data: { status: "EM_REVISAO" } });
      return "EM_REVISAO";
    }
  }

  return null;
}
