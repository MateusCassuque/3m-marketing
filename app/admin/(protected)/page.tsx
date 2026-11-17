import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Inbox,
  Repeat,
  Target,
  Timer,
  Wallet,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runRecurringBilling } from "@/lib/recurring-billing";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";
import { SERVICE_LABELS, STATUS_BADGE_VARIANT, STATUS_LABELS } from "@/lib/lead-labels";
import { PROJECT_STATUS_LABELS } from "@/lib/project-labels";
import { Badge } from "@/components/ui/badge";
import { PeriodFilter, parsePeriod } from "@/components/admin/period-filter";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import { LeadsTrendChart, RevenueChart, ServiceDonut } from "@/components/admin/dashboard/overview-charts";

export const metadata: Metadata = {
  title: "Dashboard | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_STATUSES = ["BACKLOG", "EM_ANDAMENTO", "EM_REVISAO"] as const;
const TZ = "Africa/Luanda";

const CARD =
  "rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(4,19,46,0.05),0_8px_24px_-12px_rgba(4,19,46,0.08)] ring-1 ring-navy-900/[0.04]";

function pct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function greeting() {
  const hour = Number(new Date().toLocaleString("pt-PT", { hour: "numeric", hour12: false, timeZone: TZ }));
  if (hour < 12) return "Bom dia";
  if (hour < 19) return "Boa tarde";
  return "Boa noite";
}

function todayLabel() {
  const text = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  return text.charAt(0).toUpperCase() + text.slice(1);
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
    // Emite primeiro as cobranças recorrentes já vencidas, para os números estarem certos.
    await runRecurringBilling().catch((error) => console.error("[dashboard] facturação recorrente falhou", error));

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const since = new Date(now.getTime() - days * DAY_MS);
    const previousSince = new Date(since.getTime() - days * DAY_MS);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      leadsPeriod,
      leadsPrevious,
      projectsByStatus,
      dueSoon,
      lateProjects,
      invoices,
      latestLeads,
      recurringProjects,
    ] = await Promise.all([
      prisma.lead.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, status: true, service: true },
      }),
      prisma.lead.count({ where: { createdAt: { gte: previousSince, lt: since } } }),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.project.findMany({
        where: {
          status: { in: [...OPEN_STATUSES] },
          dueDate: { gte: startToday, lte: new Date(now.getTime() + 14 * DAY_MS) },
        },
        orderBy: { dueDate: "asc" },
        take: 4,
        select: { id: true, title: true, dueDate: true, client: { select: { name: true } } },
      }),
      prisma.project.count({ where: { status: { in: [...OPEN_STATUSES] }, dueDate: { lt: startToday } } }),
      prisma.invoice.findMany({
        where: {
          OR: [
            { issueDate: { gte: sixMonthsAgo } },
            { status: { in: ["PENDENTE", "VENCIDA"] } },
            { paidAt: { gte: sixMonthsAgo } },
          ],
        },
        select: {
          id: true,
          amount: true,
          status: true,
          issueDate: true,
          dueDate: true,
          paidAt: true,
        },
      }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.project.findMany({
        where: { billingType: "RECORRENTE", status: { notIn: ["CONCLUIDO", "CANCELADO"] } },
        orderBy: { nextBillingDate: "asc" },
        select: {
          id: true,
          title: true,
          value: true,
          recurrenceMonths: true,
          nextBillingDate: true,
          client: { select: { name: true } },
        },
      }),
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
    let overdueCount = 0;
    let overdueTotal = 0;
    let dueWeekCount = 0;
    invoices.forEach((inv) => {
      const amount = Number(inv.amount);
      if (inv.status === "PAGA" && inv.paidAt && inv.paidAt >= since) receivedPeriod += amount;
      if (inv.status === "PENDENTE" || inv.status === "VENCIDA") {
        toReceive += amount;
        if (inv.status === "VENCIDA" || inv.dueDate < startToday) {
          overdueCount += 1;
          overdueTotal += amount;
        } else if (inv.dueDate.getTime() <= startToday.getTime() + 7 * DAY_MS) {
          dueWeekCount += 1;
        }
      }
    });

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

    // ---- Receita recorrente mensal (valor de cada cobrança ÷ meses do ciclo) ----
    const mrr = recurringProjects.reduce(
      (sum, p) => sum + Number(p.value) / Math.max(p.recurrenceMonths ?? 1, 1),
      0,
    );

    return {
      connected: true as const,
      leadsCount: leadsPeriod.length,
      leadsDelta: pct(leadsPeriod.length, leadsPrevious),
      conversion,
      won,
      openProjects,
      pipeline,
      dueSoon,
      lateProjects,
      receivedPeriod,
      toReceive,
      overdueCount,
      overdueTotal,
      dueWeekCount,
      revenue,
      serviceData,
      leadsSeries: buildLeadsSeries(leadsPeriod.map((l) => l.createdAt), days, now),
      latestLeads,
      mrr,
      recurringCount: recurringProjects.length,
      nextBillings: recurringProjects.filter((p) => p.nextBillingDate).slice(0, 4),
    };
  } catch (error) {
    console.error("[admin] não foi possível consultar a base de dados", error);
    return { connected: false as const };
  }
}

function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-[15px] font-bold text-navy-700">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary-600 hover:text-primary-700">
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function AttentionRow({
  icon: Icon,
  tone,
  label,
  value,
  href,
}: {
  icon: typeof AlertTriangle;
  tone: "danger" | "warning" | "neutral";
  label: string;
  value: string;
  href: string;
}) {
  const tones = {
    danger: "bg-red-50 text-red-600",
    warning: "bg-accent-50 text-accent-600",
    neutral: "bg-navy-50 text-navy-500",
  };
  return (
    <li>
      <Link href={href} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-navy-50/70">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-navy-600">{label}</span>
        <span className="text-sm font-bold text-navy-700">{value}</span>
      </Link>
    </li>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.periodo);
  const [data, session] = await Promise.all([getDashboardData(Number(period)), auth()]);
  const firstName = (session?.user?.name ?? "").split(" ")[0];

  return (
    <div className="mx-auto max-w-[1400px] p-5 sm:p-6 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{todayLabel()}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-700">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <PeriodFilter current={period} basePath="/admin" />
      </div>

      {!data.connected ? (
        <div className={`${CARD} text-center`}>
          <Inbox className="mx-auto h-9 w-9 text-navy-300" />
          <h2 className="mt-4 font-display text-lg font-bold text-navy-700">Base de dados não ligada</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Configure <code>DATABASE_URL</code> e execute <code>npm run pd</code> para ver os dados aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Indicadores principais */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Wallet}
              label="Recebido no período"
              value={formatCurrency(data.receivedPeriod)}
              hint={`A receber ${formatCurrency(data.toReceive)}`}
              accent="primary"
            />
            <KpiCard
              icon={Repeat}
              label="Receita recorrente / mês"
              value={formatCurrency(data.mrr)}
              hint={`${data.recurringCount} ${data.recurringCount === 1 ? "contrato activo" : "contratos activos"}`}
              accent="accent"
            />
            <KpiCard
              icon={Inbox}
              label="Leads no período"
              value={data.leadsCount}
              delta={data.leadsDelta}
              hint="vs. período anterior"
              accent="primary"
            />
            <KpiCard
              icon={Target}
              label="Taxa de conversão"
              value={`${data.conversion}%`}
              hint={`${data.won} ${data.won === 1 ? "lead ganho" : "leads ganhos"}`}
              accent="success"
            />
          </div>

          {/* Finanças + atenção */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
            <section className={CARD}>
              <CardHeader
                title="Facturado e recebido"
                subtitle="Últimos 6 meses, em Kwanzas"
                action={
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#D5DEEC]" /> Facturado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary-500" /> Recebido
                    </span>
                  </div>
                }
              />
              <div className="mt-5">
                <RevenueChart data={data.revenue} />
              </div>
            </section>

            <section className={CARD}>
              <CardHeader title="Precisa de atenção" subtitle="O que pode esperar menos" />
              <ul className="mt-4 space-y-1">
                <AttentionRow
                  icon={AlertTriangle}
                  tone={data.overdueCount ? "danger" : "neutral"}
                  label="Facturas em atraso"
                  value={data.overdueCount ? `${data.overdueCount} · ${formatCurrency(data.overdueTotal)}` : "Nenhuma"}
                  href="/admin/faturas?estado=vencida"
                />
                <AttentionRow
                  icon={Timer}
                  tone={data.dueWeekCount ? "warning" : "neutral"}
                  label="Facturas a vencer em 7 dias"
                  value={String(data.dueWeekCount)}
                  href="/admin/faturas?estado=pendente"
                />
                <AttentionRow
                  icon={CalendarClock}
                  tone={data.lateProjects ? "danger" : "neutral"}
                  label="Pedidos atrasados"
                  value={String(data.lateProjects)}
                  href="/admin/notificacoes"
                />
              </ul>

              <div className="mt-5 border-t border-border/70 pt-4">
                <p className="text-xs font-semibold text-muted-foreground">Entregas nos próximos 14 dias</p>
                {data.dueSoon.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Nenhuma entrega prevista.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-border/60">
                    {data.dueSoon.map((p) => (
                      <li key={p.id}>
                        <Link href={`/admin/pedidos/${p.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary-700">
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-navy-700">{p.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">{p.client.name}</span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-accent-600">
                            {p.dueDate ? formatDateNotTime(p.dueDate) : ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* Leads */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
            <section className={CARD}>
              <CardHeader title="Leads recebidos" subtitle="Pelo formulário do site" />
              <div className="mt-5">
                <LeadsTrendChart data={data.leadsSeries} />
              </div>
            </section>
            <section className={CARD}>
              <CardHeader title="Leads por serviço" subtitle="No período seleccionado" />
              <div className="mt-4">
                <ServiceDonut data={data.serviceData} />
              </div>
            </section>
          </div>

          {/* Listas */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <section className={CARD}>
              <CardHeader title="Últimos leads" action={<SeeAll href="/admin/leads">Ver todos</SeeAll>} />
              {data.latestLeads.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">Ainda não recebeu leads.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border/60">
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

            <section className={CARD}>
              <CardHeader title="Próximas cobranças recorrentes" action={<SeeAll href="/admin/pedidos">Pedidos</SeeAll>} />
              {data.nextBillings.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  Nenhum pedido recorrente. Marque a cobrança como recorrente ao criar um pedido (ex.: gestão de redes sociais).
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-border/60">
                  {data.nextBillings.map((p) => (
                    <li key={p.id}>
                      <Link href={`/admin/pedidos/${p.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-primary-700">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy-700">{p.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.client.name} · {p.nextBillingDate ? formatDateNotTime(p.nextBillingDate) : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-navy-700">{formatCurrency(Number(p.value))}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={CARD}>
              <CardHeader title="Pedidos por fase" subtitle={`${data.openProjects} em curso`} />
              <ul className="mt-5 space-y-4">
                {data.pipeline.map((row) => {
                  const max = Math.max(...data.pipeline.map((r) => r.total), 1);
                  return (
                    <li key={row.status}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-navy-600">{row.label}</span>
                        <span className="font-semibold text-navy-700">{row.total}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-navy-50">
                        <div
                          className={row.status === "CONCLUIDO" ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-primary-500"}
                          style={{ width: `${(row.total / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
