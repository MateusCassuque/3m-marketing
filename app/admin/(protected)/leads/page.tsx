import type { Metadata } from "next";
import { Inbox, MessageCircle, ThumbsUp, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { SERVICE_LABELS } from "@/lib/lead-labels";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadsByServiceChart } from "@/components/dashboard/leads-by-service-chart";
import { LeadsTable } from "@/components/dashboard/leads-table";

export const metadata: Metadata = {
  title: "Leads | Painel 3M",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function getLeadsData() {
  try {
    const [total, novos, emContato, ganhos, byService, recentLeads] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NOVO" } }),
      prisma.lead.count({ where: { status: "EM_CONTATO" } }),
      prisma.lead.count({ where: { status: "GANHO" } }),
      prisma.lead.groupBy({ by: ["service"], _count: { _all: true } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
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
    console.error("[admin/leads] não foi possível consultar o banco de dados", error);
    return { connected: false as const };
  }
}

export default async function AdminLeadsPage() {
  const data = await getLeadsData();

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Leads recebidos pelo site
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enviados pelo formulário de contato (/contato) e salvos via Prisma.
        </p>
      </div>

      {!data.connected ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-lg font-bold text-navy-700">
            Banco de dados não conectado
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Configure <code>DATABASE_URL</code> e rode <code>npm run pd</code> para
            começar a ver os leads aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="Total de leads" value={data.total} accent="navy" />
            <StatCard icon={Inbox} label="Novos" value={data.novos} accent="teal" />
            <StatCard icon={MessageCircle} label="Em contato" value={data.emContato} accent="accent" />
            <StatCard icon={ThumbsUp} label="Ganhos" value={data.ganhos} accent="success" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-base font-bold text-navy-700">Leads por serviço</h2>
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
  );
}
