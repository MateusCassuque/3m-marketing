import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";
import type { AppNotification, NotificationsPayload } from "@/lib/notification-types";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Limite por tipo, para o painel não ficar enorme. */
const LIMIT = 40;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Calcula as notificações do painel directamente a partir dos dados:
 *  - cobranças por fazer: facturas vencidas (ou pendentes com data já ultrapassada);
 *  - facturas pendentes: ainda dentro do prazo;
 *  - pedidos atrasados: entrega prevista já passou e o pedido não está concluído nem cancelado.
 * Desaparecem sozinhas quando a situação se resolve (factura paga, pedido concluído…).
 */
export async function getNotifications(adminId: string): Promise<NotificationsPayload> {
  const today = startOfToday();
  const now = new Date();

  const invoiceSelect = {
    id: true,
    number: true,
    amount: true,
    dueDate: true,
    status: true,
    project: { select: { id: true, title: true, client: { select: { name: true } } } },
  } as const;

  const [overdue, pending, lateProjects, reads] = await Promise.all([
    prisma.invoice.findMany({
      where: { OR: [{ status: "VENCIDA" }, { status: "PENDENTE", dueDate: { lt: today } }] },
      orderBy: { dueDate: "asc" },
      take: LIMIT,
      select: invoiceSelect,
    }),
    prisma.invoice.findMany({
      where: { status: "PENDENTE", dueDate: { gte: today } },
      orderBy: { dueDate: "asc" },
      take: LIMIT,
      select: invoiceSelect,
    }),
    prisma.project.findMany({
      where: { status: { in: ["BACKLOG", "EM_ANDAMENTO", "EM_REVISAO"] }, dueDate: { lt: today } },
      orderBy: { dueDate: "asc" },
      take: LIMIT,
      select: { id: true, title: true, dueDate: true, client: { select: { name: true } } },
    }),
    prisma.notificationRead.findMany({ where: { adminId }, select: { key: true } }),
  ]);

  const readKeys = new Set(reads.map((r) => r.key));
  const items: AppNotification[] = [];

  overdue.forEach((inv) => {
    const late = Math.max(daysBetween(inv.dueDate, now), 1);
    const key = `invoice-overdue:${inv.id}`;
    items.push({
      key,
      type: "invoice-overdue",
      title: `Cobrança por fazer · ${inv.number}`,
      body: `${inv.project.client.name} · ${formatCurrency(Number(inv.amount))} · venceu há ${plural(late, "dia", "dias")}`,
      href: `/admin/faturas?estado=vencida&q=${encodeURIComponent(inv.number)}`,
      at: inv.dueDate.toISOString(),
      severity: late > 7 ? 3 : 2,
      read: readKeys.has(key),
    });
  });

  pending.forEach((inv) => {
    const left = daysBetween(today, inv.dueDate);
    const when = left <= 0 ? "vence hoje" : left === 1 ? "vence amanhã" : `vence em ${left} dias`;
    const key = `invoice-pending:${inv.id}`;
    items.push({
      key,
      type: "invoice-pending",
      title: `Factura pendente · ${inv.number}`,
      body: `${inv.project.client.name} · ${formatCurrency(Number(inv.amount))} · ${when}`,
      href: `/admin/faturas?estado=pendente&q=${encodeURIComponent(inv.number)}`,
      at: inv.dueDate.toISOString(),
      severity: left <= 3 ? 2 : 1,
      read: readKeys.has(key),
    });
  });

  lateProjects.forEach((project) => {
    if (!project.dueDate) return;
    const late = Math.max(daysBetween(project.dueDate, now), 1);
    const key = `project-late:${project.id}`;
    items.push({
      key,
      type: "project-late",
      title: `Pedido atrasado · ${project.title}`,
      body: `${project.client.name} · entrega prevista a ${formatDateNotTime(project.dueDate)} · atrasado há ${plural(late, "dia", "dias")}`,
      href: `/admin/pedidos/${project.id}`,
      at: project.dueDate.toISOString(),
      severity: late > 7 ? 3 : 2,
      read: readKeys.has(key),
    });
  });

  // Não lidas primeiro; depois as mais urgentes; depois as mais antigas.
  items.sort(
    (a, b) =>
      Number(a.read) - Number(b.read) ||
      b.severity - a.severity ||
      new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return { items, unread: items.filter((i) => !i.read).length };
}
