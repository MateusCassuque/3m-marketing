import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, Inbox, Receipt, Users, Wallet } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Visão geral | Painel 3M",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const QUICK_LINKS = [
  { label: "Ver leads", href: "/admin/leads", icon: Inbox },
  { label: "Gerenciar clientes", href: "/admin/clientes", icon: Users },
  { label: "Ver pedidos", href: "/admin/pedidos", icon: Briefcase },
  { label: "Emitir faturas", href: "/admin/faturas", icon: Receipt },
];

async function getOverviewData() {
  try {
    const [leadsNovos, clientesCount, pedidosAtivos, faturasPendentes] = await Promise.all([
      prisma.lead.count({ where: { status: "NOVO" } }),
      prisma.client.count(),
      prisma.project.count({ where: { status: { in: ["BACKLOG", "EM_ANDAMENTO", "EM_REVISAO"] } } }),
      prisma.invoice.findMany({ where: { status: "PENDENTE" }, select: { amount: true } }),
    ]);

    const pendenteEmAberto = faturasPendentes.reduce((sum, i) => sum + Number(i.amount), 0);

    return {
      connected: true as const,
      leadsNovos,
      clientesCount,
      pedidosAtivos,
      pendenteEmAberto,
    };
  } catch (error) {
    console.error("[admin] não foi possível consultar o banco de dados", error);
    return { connected: false as const };
  }
}

export default async function AdminOverviewPage() {
  const data = await getOverviewData();

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Visão geral
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo rápido de leads, clientes, pedidos e faturas.
        </p>
      </div>

      {data.connected && (
        <div className="mb-8 grid md:grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Inbox} label="Leads novos" value={data.leadsNovos} accent="teal" />
          <StatCard icon={Users} label="Clientes" value={data.clientesCount} accent="navy" />
          <StatCard icon={Briefcase} label="Pedidos ativos" value={data.pedidosAtivos} accent="accent" />
          <StatCard
            icon={Wallet}
            label="A receber (pendente)"
            value={formatCurrency(data.pendenteEmAberto)}
            accent="success"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-soft transition-colors hover:border-primary-300"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="text-sm font-bold text-navy-700">{label}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
