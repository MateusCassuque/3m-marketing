import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CalendarClock,
  Inbox,
  Target,
  Users,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";
import { SERVICE_LABELS, STATUS_BADGE_VARIANT, STATUS_LABELS } from "@/lib/lead-labels";
import { PROJECT_STATUS_LABELS } from "@/lib/project-labels";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { PeriodFilter, parsePeriod } from "@/components/admin/period-filter";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import {
  LeadsTrendChart,
  RevenueChart,
  ServiceDonut,
} from "@/components/admin/dashboard/overview-charts";

export const metadata: Metadata = {
  title: "Dashboard | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_STATUSES = ["BACKLOG", "EM_ANDAMENTO", "EM_REVISAO"] as const;

function pct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Agrupa leads em pontos do gráfico: diário (≤30d), semanal (90d) ou mensal (12m). */
function buildLeadsSeries(dates: Date[], days: number, now: Date) {
  const buckets: { label: string; start: number; end: number; leads: number }[] = [];

  if (days <= 30) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    for (let i = days - 1; i >= 0; i--) {
      const start = today - i * DAY_MS;
      const d = new Date(start);
      buckets.push({ label: `${d.getDate()} ${MONTHS[d.getMonth()]}`, start, end: start + DAY_MS, leads: 0 });
    }
  } else if (days <= 90) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() + DAY_MS;
    const weeks = Math.ceil(days / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const start = today - (i + 1) * 7 * DAY_MS;
      const d = new Date(start);
      buckets.push({ label: `${d.getDate()} ${MONTHS[d.getMonth()]}`, start, end: start + 7 * DAY_MS, leads: 0 });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({ label: MONTHS[start.getMonth()], start: start.getTime(), end: end.getTime(), leads: 0 });
    }
  }

  dates.forEach((date) => {
    const t = date.getTime();
    const bucket = buckets.find((b) => t >= b.start && t < b.end);
    if (bucket) bucket.leads += 1;
  });

  return buckets.map(({ label, leads }) => ({ label, leads }));
}

async function getDashboardData(days: number) {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - days * DAY_MS);
    const previousSince = new Date(since.getTime() - days * DAY_MS);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      leadsPeriod,
      leadsPrevious,
      clientsTotal,
      clientsNew,
      projectsByStatus,
      dueSoon,
      invoices,
      latestLeads,
    ] = await Promise.all([
      prisma.lead.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, status: true, service: true },
      }),
      prisma.lead.count({ where: { createdAt: { gte: previousSince, lt: since } } }),
      prisma.client.count(),
      prisma.client.count({ where: { createdAt: { gte: since } } }),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.project.findMany({
        where: {
          status: { in: [...OPEN_STATUSES] },
          dueDate: { not: null, lte: new Date(now.getTime() + 14 * DAY_MS) },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: { id: true, title: true, dueDate: true, client: { select: { name: true } } },
      }),
      prisma.invoice.findMany({
        where: { OR: [{ issueDate: { gte: sixMonthsAgo } }, { status: { in: ["PENDENTE", "VENCIDA"] } }, { paidAt: { gte: sixMonthsAgo } }] },
        select: {
          id: true,
          number: true,
          amount: true,
          status: true,
          issueDate: true,
          dueDate: true,
          paidAt: true,
          project: { select: { title: true, client: { select: { name: true } } } },
        },
      }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    ]);

    // ---- Leads ----
    const won = leadsPeriod.filter((l) => l.status === "GANHO").length;
    const conversion = leadsPeriod.length ? Math.round((won / leadsPeriod.length) * 100) : 0;
    const byService = new Map<string, number>();
    leadsPeriod.forEach((l) => byService.set(l.service, (byService.get(l.service) ?? 0) + 1));
    const serviceData = Array.from(byService.entries())
      .map(([service, total]) => ({ service: SERVICE_LABELS[service as keyof typeof SERVICE_LABELS], total }))
      .sort((a, b) => b.total - a.total);

    // ---- Pedidos ----
    const statusCount = new Map(projectsByStatus.map((row) => [row.status, row._count._all]));
    const openProjects = OPEN_STATUSES.reduce((sum, s) => sum + (statusCount.get(s) ?? 0), 0);
    const pipeline = [...OPEN_STATUSES, "CONCLUIDO" as const].map((status) => ({
      status,
      label: PROJECT_STATUS_LABELS[status],
      total: statusCount.get(status) ?? 0,
    }));

    // ---- Facturas ----
    let receivedPeriod = 0;
    let toReceive = 0;
    const overdue: typeof invoices = [];
    invoices.forEach((inv) => {
      const amount = Number(inv.amount);
      if (inv.status === "PAGA" && inv.paidAt && inv.paidAt >= since) receivedPeriod += amount;
      if (inv.status === "PENDENTE" || inv.status === "VENCIDA") {
        toReceive += amount;
        if (inv.status === "VENCIDA" || inv.dueDate < now) overdue.push(inv);
      }
    });
    overdue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const overdueTotal = overdue.reduce((sum, inv) => sum + Number(inv.amount), 0);

    const revenue = [];
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const same = (d: Date) => d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      revenue.push({
        month: MONTHS[ref.getMonth()],
        facturado: invoices
          .filter((inv) => inv.status !== "CANCELADA" && same(inv.issueDate))
          .reduce((s, inv) => s + Number(inv.amount), 0),
        recebido: invoices
          .filter((inv) => inv.status === "PAGA" && inv.paidAt && same(inv.paidAt))
          .reduce((s, inv) => s + Number(inv.amount), 0),
      });
    }

    return {
      connected: true as const,
      leadsCount: leadsPeriod.length,
      leadsDelta: pct(leadsPeriod.length, leadsPrevious),
      conversion,
      won,
      clientsTotal,
      clientsNew,
      openProjects,
      pipeline,
      dueSoon,
      receivedPeriod,
      toReceive,
      overdue: overdue.slice(0, 5),
      overdueCount: overdue.length,
      overdueTotal,
      revenue,
      serviceData,
      leadsSeries: buildLeadsSeries(leadsPeriod.map((l) => l.createdAt), days, now),
      latestLeads,
    };
  } catch (error) {
    console.error("[admin] não foi possível consultar a base de dados", error);
    return { connected: false as const };
  }
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.periodo);
  const data = await getDashboardData(Number(period));

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader title="Dashboard" description="Leads, pedidos e finanças da Kodeza · 3M num só sítio.">
        <PeriodFilter current={period} basePath="/admin" />
      </PageHeader>

      {!data.connected ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-lg font-bold text-navy-700">Base de dados não ligada</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Configure <code>DATABASE_URL</code> e execute <code>npm run pd</code> para ver os dados aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              icon={Inbox}
              label="Leads no período"
              value={data.leadsCount}
              delta={data.leadsDelta}
              hint="Variação face ao período anterior"
              tone="primary"
            />
            <KpiCard
              icon={Target}
              label="Taxa de conversão"
              value={`${data.conversion}%`}
              hint={`${data.won} lead${data.won === 1 ? "" : "s"} ganho${data.won === 1 ? "" : "s"} no período`}
              tone="success"
            />
            <KpiCard
              icon={Wallet}
              label="Recebido no período"
              value={formatCurrency(data.receivedPeriod)}
              hint={`A receber: ${formatCurrency(data.toReceive)}`}
              tone="navy"
            />
            <KpiCard
              icon={Briefcase}
              label="Pedidos em curso"
              value={data.openProjects}
              hint="Backlog, em andamento e em revisão"
              tone="accent"
            />
            <KpiCard
              icon={Users}
              label="Clientes"
              value={data.clientsTotal}
              hint={`${data.clientsNew} novo${data.clientsNew === 1 ? "" : "s"} no período`}
              tone="primary"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Facturas em atraso"
              value={data.overdueCount}
              hint={data.overdueCount ? formatCurrency(data.overdueTotal) : "Tudo em dia"}
              tone={data.overdueCount ? "danger" : "success"}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-navy-700">Leads recebidos</h2>
              <p className="text-xs text-muted-foreground">Pelo formulário do site</p>
              <div className="mt-4">
                <LeadsTrendChart data={data.leadsSeries} />
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-navy-700">Leads por serviço</h2>
              <p className="text-xs text-muted-foreground">No período seleccionado</p>
              <div className="mt-4">
                <ServiceDonut data={data.serviceData} />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-navy-700">Facturado vs. recebido</h2>
              <p className="text-xs text-muted-foreground">Últimos 6 meses, em Kwanzas</p>
              <div className="mt-4">
                <RevenueChart data={data.revenue} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-navy-700">Pedidos por fase</h2>
              <ul className="mt-5 space-y-4">
                {data.pipeline.map((row) => {
                  const max = Math.max(...data.pipeline.map((r) => r.total), 1);
                  return (
                    <li key={row.status}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-navy-600">{row.label}</span>
                        <span className="font-semibold text-navy-700">{row.total}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy-50">
                        <div
                          className={row.status === "CONCLUIDO" ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-primary-500"}
                          style={{ width: `${(row.total / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <h3 className="mt-8 flex items-center gap-2 text-sm font-bold text-navy-700">
                <CalendarClock className="h-4 w-4 text-accent-600" /> Entregas nos próximos 14 dias
              </h3>
              {data.dueSoon.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Nenhuma entrega próxima.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {data.dueSoon.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-navy-700">{p.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{p.client.name}</span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-accent-600">
                        {p.dueDate ? formatDateNotTime(p.dueDate) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-navy-700">Últimos leads</h2>
                <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                  Ver todos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {data.latestLeads.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">Ainda não recebeu leads.</p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {data.latestLeads.map((lead) => (
                    <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-700">{lead.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {SERVICE_LABELS[lead.service]} · {formatDateNotTime(lead.createdAt)}
                        </p>
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANT[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-navy-700">Facturas por cobrar</h2>
                <Link href="/admin/faturas" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                  Ver facturas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {data.overdue.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">Sem facturas em atraso. Bom trabalho!</p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {data.overdue.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-700">
                          {inv.number} · {inv.project.client.name}
                        </p>
                        <p className="truncate text-xs text-red-600">Venceu em {formatDateNotTime(inv.dueDate)}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-navy-700">{formatCurrency(Number(inv.amount))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
