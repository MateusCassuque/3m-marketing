import type { Metadata } from "next";
import { AlertTriangle, Inbox, MessageCircle, ThumbsUp, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { SERVICE_LABELS } from "@/lib/lead-labels";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadsByServiceChart } from "@/components/dashboard/leads-by-service-chart";
import { LeadsTable } from "@/components/dashboard/leads-table";

export const metadata: Metadata = {
  title: "Dashboard de Leads | 3M Agência de Marketing",
  robots: { index: false, follow: false },
};

// Painel é sempre renderizado no servidor, com os dados mais recentes.
export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [total, novos, emContato, ganhos, byService, recentLeads] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NOVO" } }),
      prisma.lead.count({ where: { status: "EM_CONTATO" } }),
      prisma.lead.count({ where: { status: "GANHO" } }),
      prisma.lead.groupBy({ by: ["service"], _count: { _all: true } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

    return {
      connected: true as const,
      total,
      novos,
      emContato,
      ganhos,
      chartData: byService.map((row) => ({
        service: SERVICE_LABELS[row.service],
        total: row._count._all,
      })),
      recentLeads,
    };
  } catch (error) {
    console.error("[dashboard] não foi possível consultar o banco de dados", error);
    return { connected: false as const };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <section className="bg-muted/40 py-14 lg:py-16">
      <div className="container-padded">
        <div className="mb-8 flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-navy-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Painel interno
          </span>
          <h1 className="font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">
            Leads recebidos pelo site
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Dados enviados pelo formulário de contato (/contato) e salvos via
            Prisma. Use este painel para acompanhar volume e priorizar
            atendimento.
          </p>
        </div>

        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Rota sem autenticação.</strong> Esta página expõe dados
            pessoais de clientes (nome, e-mail, telefone e mensagem). Antes de
            publicar em produção, proteja <code>/dashboard</code> com login
            (ex.: NextAuth, Clerk) ou middleware — nunca deixe este painel
            público.
          </p>
        </div>

        {!data.connected ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-lg font-bold text-navy-700">
              Banco de dados não conectado
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Configure <code>DATABASE_URL</code> no <code>.env</code> e rode{" "}
              <code>npx prisma migrate dev</code> para começar a ver os leads
              enviados pelo formulário de contato aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={Users} label="Total de leads" value={data.total} accent="navy" />
              <StatCard icon={Inbox} label="Novos" value={data.novos} accent="teal" />
              <StatCard
                icon={MessageCircle}
                label="Em contato"
                value={data.emContato}
                accent="accent"
              />
              <StatCard icon={ThumbsUp} label="Ganhos" value={data.ganhos} accent="success" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
              <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                <h2 className="font-display text-base font-bold text-navy-700">
                  Leads por serviço
                </h2>
                <div className="mt-4">
                  <LeadsByServiceChart data={data.chartData} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                <h2 className="mb-4 font-display text-base font-bold text-navy-700">
                  Últimos leads recebidos
                </h2>
                <LeadsTable leads={data.recentLeads} />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
