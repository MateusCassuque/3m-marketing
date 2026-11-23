import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleAlert, Clock, Landmark, PiggyBank, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getAccountSummaries } from "@/lib/accounts";
import { EXPENSE_COLORS, EXPENSE_LABELS } from "@/lib/expense-labels";
import { rangeWhere, resolveRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import { CashflowChart } from "@/components/admin/financeiro/finance-charts";
import { FinanceTabs } from "@/components/admin/financeiro/finance-tabs";

export const metadata: Metadata = {
  title: "Financeiro | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CARD =
  "rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(4,19,46,0.05),0_8px_24px_-12px_rgba(4,19,46,0.08)] ring-1 ring-navy-900/[0.04]";

async function getFinanceData(range: ReturnType<typeof resolveRange>) {
  try {
    const filter = rangeWhere(range);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      issued,
      paid,
      open,
      expensesTotal,
      expensesByCategory,
      expensesByAccount,
      paidByAccount,
      monthlyPaid,
      monthlyExpenses,
      accounts,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { status: { not: "CANCELADA" }, ...(filter ? { issueDate: filter } : {}) },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "PAGA", ...(filter ? { paidAt: filter } : {}) },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.invoice.findMany({
        where: { status: { in: ["PENDENTE", "VENCIDA"] } },
        select: { amount: true, status: true, dueDate: true },
      }),
      prisma.expense.aggregate({ where: filter ? { date: filter } : {}, _sum: { amount: true }, _count: { _all: true } }),
      prisma.expense.groupBy({ by: ["category"], where: filter ? { date: filter } : {}, _sum: { amount: true } }),
      prisma.expense.groupBy({
        by: ["accountId"],
        where: filter ? { date: filter } : {},
        _sum: { amount: true },
      }),
      prisma.invoice.groupBy({
        by: ["accountId"],
        where: { status: "PAGA", ...(filter ? { paidAt: filter } : {}) },
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { status: "PAGA", paidAt: { gte: sixMonthsAgo } },
        select: { amount: true, paidAt: true },
      }),
      prisma.expense.findMany({ where: { date: { gte: sixMonthsAgo } }, select: { amount: true, date: true } }),
      getAccountSummaries(),
    ]);

    const faturado = Number(issued._sum.amount ?? 0);
    const recebido = Number(paid._sum.amount ?? 0);
    const despesas = Number(expensesTotal._sum.amount ?? 0);
    const lucro = recebido - despesas;

    let porReceber = 0;
    let emAtraso = 0;
    open.forEach((inv) => {
      const amount = Number(inv.amount);
      porReceber += amount;
      if (inv.status === "VENCIDA" || inv.dueDate < now) emAtraso += amount;
    });

    const receivedBy = new Map(paidByAccount.map((r) => [r.accountId, Number(r._sum.amount ?? 0)]));
    const spentBy = new Map(expensesByAccount.map((r) => [r.accountId, Number(r._sum.amount ?? 0)]));

    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const same = (d: Date | null) => !!d && d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      monthly.push({
        month: MONTHS[ref.getMonth()],
        recebido: monthlyPaid.filter((inv) => same(inv.paidAt)).reduce((s, inv) => s + Number(inv.amount), 0),
        despesas: monthlyExpenses.filter((e) => same(e.date)).reduce((s, e) => s + Number(e.amount), 0),
      });
    }

    const categories = expensesByCategory
      .map((c) => ({ category: c.category, total: Number(c._sum.amount ?? 0) }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      connected: true as const,
      faturado,
      recebido,
      despesas,
      lucro,
      porReceber,
      emAtraso,
      saldoTotal: accounts.filter((a) => a.active).reduce((s, a) => s + a.balance, 0),
      accounts: accounts.map((a) => ({
        ...a,
        receivedInRange: receivedBy.get(a.id) ?? 0,
        spentInRange: spentBy.get(a.id) ?? 0,
      })),
      receivedWithoutAccount: receivedBy.get(null) ?? 0,
      paidCount: paid._count._all,
      expensesCount: expensesTotal._count._all,
      monthly,
      categories,
    };
  } catch (error) {
    console.error("[financeiro] não foi possível consultar a base de dados", error);
    return { connected: false as const };
  }
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params, "ano");
  const data = await getFinanceData(range);

  return (
    <div className="mx-auto max-w-[1400px] p-5 sm:p-6 lg:p-10">
      <PageHeader title="Financeiro" description="O que facturou, o que recebeu, o que gastou — e onde está o dinheiro.">
        <DateRangeFilter current={range} />
      </PageHeader>
      <FinanceTabs />

      {!data.connected ? (
        <div className={`${CARD} text-center text-sm text-muted-foreground`}>Base de dados não ligada.</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <KpiCard icon={Receipt} label="Facturado no período" value={formatCurrency(data.faturado)} hint="Facturas emitidas (sem canceladas)" accent="primary" />
            <KpiCard icon={TrendingUp} label="Recebido no período" value={formatCurrency(data.recebido)} hint={`${data.paidCount} ${data.paidCount === 1 ? "pagamento" : "pagamentos"}`} accent="success" />
            <KpiCard icon={TrendingDown} label="Despesas no período" value={formatCurrency(data.despesas)} hint={`${data.expensesCount} ${data.expensesCount === 1 ? "registo" : "registos"}`} accent="accent" />
            <KpiCard
              icon={PiggyBank}
              label="Lucro (recebido − despesas)"
              value={formatCurrency(data.lucro)}
              hint={data.lucro >= 0 ? "Resultado positivo no período" : "Gastou mais do que recebeu"}
              accent={data.lucro >= 0 ? "success" : "danger"}
            />
            <KpiCard
              icon={Clock}
              label="Por receber"
              value={formatCurrency(data.porReceber)}
              hint={data.emAtraso > 0 ? `${formatCurrency(data.emAtraso)} em atraso` : "Nada em atraso"}
              accent={data.emAtraso > 0 ? "danger" : "primary"}
            />
            <KpiCard icon={Wallet} label="Saldo nas contas" value={formatCurrency(data.saldoTotal)} hint={`${data.accounts.filter((a) => a.active).length} contas activas`} accent="primary" />
          </div>

          {/* Onde está o dinheiro */}
          <section className={CARD}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-[15px] font-bold text-navy-700">Onde está o dinheiro</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Saldo actual de cada conta e o que entrou e saiu no período</p>
              </div>
              <Link href="/admin/financeiro/contas" className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary-600 hover:text-primary-700">
                Gerir contas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.accounts.filter((a) => a.active).length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Ainda não criou contas. Crie uma (banco, PayPay, caixa…) e passe a indicar onde recebe cada pagamento.
              </p>
            ) : (
              <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.accounts
                  .filter((a) => a.active)
                  .map((account) => (
                    <li key={account.id} className="rounded-xl border border-border/70 p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Landmark className="h-[18px] w-[18px]" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy-700">{account.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{account.bankName ?? "—"}</p>
                        </div>
                      </div>
                      <p className={`mt-3 font-display text-xl font-bold ${account.balance < 0 ? "text-red-600" : "text-navy-700"}`}>
                        {formatCurrency(account.balance)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-emerald-600">+{formatCurrency(account.receivedInRange)}</span> recebido ·{" "}
                        <span className="font-semibold text-accent-700">−{formatCurrency(account.spentInRange)}</span> gasto
                      </p>
                    </li>
                  ))}
              </ul>
            )}

            {data.receivedWithoutAccount > 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-accent-50 px-3 py-2.5 text-[13px] leading-snug text-accent-800">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {formatCurrency(data.receivedWithoutAccount)} recebidos neste período não têm conta indicada. Edite essas facturas
                para dizer onde o dinheiro entrou.
              </p>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
            <section className={CARD}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-[15px] font-bold text-navy-700">Entradas e saídas</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Últimos 6 meses, em Kwanzas</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary-500" /> Recebido
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent-500" /> Despesas
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <CashflowChart data={data.monthly} />
              </div>
            </section>

            <section className={CARD}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-[15px] font-bold text-navy-700">Para onde foi o dinheiro</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Despesas por categoria, no período</p>
                </div>
                <Link href="/admin/financeiro/despesas" className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary-600 hover:text-primary-700">
                  Despesas <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {data.categories.length === 0 ? (
                <p className="mt-8 text-center text-sm text-muted-foreground">Sem despesas neste período.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {data.categories.map((c, i) => {
                    const pct = data.despesas > 0 ? Math.round((c.total / data.despesas) * 100) : 0;
                    return (
                      <li key={c.category}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-medium text-navy-600">{EXPENSE_LABELS[c.category]}</span>
                          <span className="shrink-0 font-semibold text-navy-700">{formatCurrency(c.total)}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-50">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
                          </div>
                          <span className="w-9 text-right text-xs text-muted-foreground">{pct}%</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
