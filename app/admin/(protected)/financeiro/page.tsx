import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, Wallet } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { MonthlyRevenueChart, InvoiceStatusChart } from "@/components/admin/financeiro/finance-charts";

export const metadata: Metadata = {
  title: "Financeiro | Painel 3M",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

async function getFinanceData() {
  try {
    const invoices = await prisma.invoice.findMany({
      select: { amount: true, status: true, issueDate: true, dueDate: true },
    });

    const now = new Date();
    let totalFaturado = 0;
    let totalRecebido = 0;
    let totalPendente = 0;
    let totalVencido = 0;
    let totalCancelado = 0;

    for (const invoice of invoices) {
      const amount = Number(invoice.amount);
      const isOverdue = invoice.status === "PENDENTE" && invoice.dueDate < now;

      if (invoice.status === "CANCELADA") {
        totalCancelado += amount;
        continue;
      }

      totalFaturado += amount;

      if (invoice.status === "PAGA") totalRecebido += amount;
      else if (invoice.status === "VENCIDA" || isOverdue) totalVencido += amount;
      else totalPendente += amount;
    }

    // Faturamento (emitido) dos últimos 6 meses, incluindo meses sem faturas.
    const monthly: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const reference = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = MONTH_LABELS[reference.getMonth()];
      const total = invoices
        .filter(
          (inv) =>
            inv.status !== "CANCELADA" &&
            inv.issueDate.getFullYear() === reference.getFullYear() &&
            inv.issueDate.getMonth() === reference.getMonth(),
        )
        .reduce((sum, inv) => sum + Number(inv.amount), 0);
      monthly.push({ month: label, total });
    }

    const statusBreakdown = [
      { status: "Recebido", total: totalRecebido, color: "#059669" },
      { status: "Pendente", total: totalPendente, color: "#1583A6" },
      { status: "Vencido", total: totalVencido, color: "#DC2626" },
    ];

    return {
      connected: true as const,
      totalFaturado,
      totalRecebido,
      totalPendente,
      totalVencido,
      monthly,
      statusBreakdown,
    };
  } catch (error) {
    console.error("[admin/financeiro] não foi possível consultar o banco de dados", error);
    return { connected: false as const };
  }
}

export default async function FinanceiroPage() {
  const data = await getFinanceData();

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Financeiro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calculado em tempo real a partir das faturas — não é uma planilha
          separada, é a mesma tabela de <code>Invoice</code> vista de outro
          ângulo.
        </p>
      </div>

      {!data.connected ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <Wallet className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-lg font-bold text-navy-700">
            Banco de dados não conectado
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Configure <code>DATABASE_URL</code> e rode <code>npm run pd</code> para
            ver os números financeiros aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={Wallet}
              label="Total faturado"
              value={currencyFormatter.format(data.totalFaturado)}
              accent="navy"
            />
            <StatCard
              icon={CheckCircle2}
              label="Recebido"
              value={currencyFormatter.format(data.totalRecebido)}
              accent="success"
            />
            <StatCard
              icon={Clock}
              label="Pendente"
              value={currencyFormatter.format(data.totalPendente)}
              accent="teal"
            />
            <StatCard
              icon={AlertTriangle}
              label="Vencido"
              value={currencyFormatter.format(data.totalVencido)}
              accent="destructive"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-navy-700">
                Faturamento emitido — últimos 6 meses
              </h2>
              <div className="mt-4">
                <MonthlyRevenueChart data={data.monthly} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-navy-700">
                Distribuição por status
              </h2>
              <div className="mt-2">
                <InvoiceStatusChart data={data.statusBreakdown} />
              </div>
              <ul className="mt-2 flex flex-col gap-2">
                {data.statusBreakdown.map((item) => (
                  <li key={item.status} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-navy-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.status}
                    </span>
                    <span className="font-semibold text-navy-700">
                      {currencyFormatter.format(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
