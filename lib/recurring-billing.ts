import { prisma } from "@/lib/prisma";
import { nextInvoiceNumber } from "@/lib/invoice-number";

/**
 * Facturação recorrente (ex.: gestão mensal de redes sociais).
 *
 * Cada projecto recorrente tem uma `nextBillingDate`. Quando essa data chega, o sistema:
 *   1. emite uma factura nova (valor = `value` do projecto, emissão = data de cobrança,
 *      vencimento = emissão + `paymentTermDays`);
 *   2. avança `nextBillingDate` pela periodicidade (1, 3, 6 ou 12 meses).
 * Se o sistema esteve parado, recupera os ciclos em atraso (até 24 por execução).
 *
 * É seguro chamar várias vezes e em simultâneo: o ponteiro só avança se ainda for o mesmo
 * (updateMany condicional), por isso nunca se emite a mesma cobrança duas vezes.
 *
 * Corre: ao abrir o painel (sino de notificações, dashboard, facturas), ao criar/editar um
 * projecto recorrente e diariamente pelo cron (/api/cron/recurring-invoices).
 */

const MAX_CYCLES_PER_PROJECT = 24;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Soma meses mantendo o dia (31 Jan + 1 mês = 28/29 Fev, e não 3 Mar). */
export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

type CycleResult = "created" | "stop";

async function billOneCycle(projectId: string): Promise<CycleResult> {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      select: {
        value: true,
        status: true,
        billingType: true,
        recurrenceMonths: true,
        nextBillingDate: true,
        recurrenceEndDate: true,
        paymentTermDays: true,
      },
    });

    if (
      !project ||
      project.billingType !== "RECORRENTE" ||
      !project.nextBillingDate ||
      !project.recurrenceMonths ||
      project.status === "CONCLUIDO" ||
      project.status === "CANCELADO"
    ) {
      return "stop";
    }

    const billingDate = project.nextBillingDate;
    if (billingDate.getTime() > Date.now()) return "stop";

    // Passou a data de fim: a recorrência acaba aqui.
    if (project.recurrenceEndDate && billingDate.getTime() > project.recurrenceEndDate.getTime()) {
      await tx.project.update({ where: { id: projectId }, data: { nextBillingDate: null } });
      return "stop";
    }

    // "Trinco": só quem conseguir avançar o ponteiro emite a factura.
    const moved = await tx.project.updateMany({
      where: { id: projectId, nextBillingDate: billingDate },
      data: { nextBillingDate: addMonths(billingDate, project.recurrenceMonths) },
    });
    if (moved.count === 0) return "stop";

    const last = await tx.invoice.aggregate({
      where: { projectId, recurringCycle: { not: null } },
      _max: { recurringCycle: true },
    });
    const cycle = (last._max.recurringCycle ?? 0) + 1;

    await tx.invoice.create({
      data: {
        number: await nextInvoiceNumber(tx),
        projectId,
        amount: project.value,
        status: "PENDENTE",
        issueDate: billingDate,
        dueDate: new Date(billingDate.getTime() + project.paymentTermDays * DAY_MS),
        recurringCycle: cycle,
        notes: `Cobrança recorrente n.º ${cycle}`,
      },
    });

    return "created";
  });
}

/** Emite as facturas recorrentes em atraso. Devolve quantas criou. */
export async function runRecurringBilling(options: { projectId?: string } = {}): Promise<number> {
  const due = await prisma.project.findMany({
    where: {
      ...(options.projectId ? { id: options.projectId } : {}),
      billingType: "RECORRENTE",
      status: { notIn: ["CONCLUIDO", "CANCELADO"] },
      nextBillingDate: { lte: new Date() },
    },
    select: { id: true },
  });

  let created = 0;
  for (const { id } of due) {
    for (let i = 0; i < MAX_CYCLES_PER_PROJECT; i++) {
      const result = await billOneCycle(id);
      if (result === "stop") break;
      created += 1;
    }
  }
  return created;
}
