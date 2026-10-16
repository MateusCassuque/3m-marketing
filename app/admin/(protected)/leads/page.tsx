import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Inbox, Search } from "lucide-react";
import type { LeadStatus, Prisma, ServiceInterest } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SERVICE_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/lead-labels";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LeadsManager, type LeadRow } from "@/components/admin/leads/leads-manager";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leads | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;
const PERIOD_OPTIONS = [
  { value: "", label: "Sempre" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

type SearchParams = { [key: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const q = one(raw.q).trim();
  const estado = one(raw.estado);
  const servico = one(raw.servico);
  const periodo = one(raw.periodo);
  const page = Math.max(1, Number(one(raw.page)) || 1);

  const session = await auth();
  const canEdit = session?.user?.role === "ADMIN";

  const where: Prisma.LeadWhereInput = {};
  if (estado in STATUS_LABELS) where.status = estado as LeadStatus;
  if (servico in SERVICE_LABELS) where.service = servico as ServiceInterest;
  if (Number(periodo) > 0) where.createdAt = { gte: new Date(Date.now() - Number(periodo) * 24 * 60 * 60 * 1000) };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  let data:
    | { connected: true; leads: LeadRow[]; total: number; counts: Map<string, number>; all: number }
    | { connected: false };

  try {
    const [leads, total, grouped] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.lead.count({ where }),
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    const counts = new Map(grouped.map((g) => [g.status as string, g._count._all]));
    data = {
      connected: true,
      leads: leads.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
      total,
      counts,
      all: grouped.reduce((sum, g) => sum + g._count._all, 0),
    };
  } catch (error) {
    console.error("[admin/leads] não foi possível consultar a base de dados", error);
    data = { connected: false };
  }

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    const base: Record<string, string> = { q, estado, servico, periodo };
    Object.entries({ ...base, ...overrides }).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
    return search.toString();
  };

  const totalPages = data.connected ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader
        title="Leads"
        description="Pedidos de proposta enviados pelo formulário do site. Altere o estado, guarde notas e converta em cliente."
      >
        <Button variant="outline" size="sm" asChild>
          <a href={`/admin/leads/export?${buildQuery({ page: undefined })}`}>
            <Download className="h-4 w-4" /> Exportar CSV
          </a>
        </Button>
      </PageHeader>

      {!data.connected ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-lg font-bold text-navy-700">Base de dados não ligada</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Configure <code>DATABASE_URL</code> e execute <code>npm run pd</code>.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/leads"
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                !estado ? "border-navy-700 bg-navy-700 text-white" : "border-border bg-white text-navy-500 hover:border-primary-300",
              )}
            >
              Todos <span className="ml-1 opacity-60">{data.all}</span>
            </Link>
            {STATUS_ORDER.map((s) => (
              <Link
                key={s}
                href={`/admin/leads?${buildQuery({ estado: s, page: undefined })}`}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  estado === s ? "border-navy-700 bg-navy-700 text-white" : "border-border bg-white text-navy-500 hover:border-primary-300",
                )}
              >
                {STATUS_LABELS[s]} <span className="ml-1 opacity-60">{data.counts.get(s) ?? 0}</span>
              </Link>
            ))}
          </div>

          <form method="GET" className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
            {estado && <input type="hidden" name="estado" value={estado} />}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={q} placeholder="Pesquisar nome, e-mail ou mensagem" className="pl-10" />
            </div>
            <Select name="servico" defaultValue={servico} aria-label="Serviço">
              <option value="">Todos os serviços</option>
              {(Object.keys(SERVICE_LABELS) as ServiceInterest[]).map((s) => (
                <option key={s} value={s}>
                  {SERVICE_LABELS[s]}
                </option>
              ))}
            </Select>
            <Select name="periodo" defaultValue={periodo} aria-label="Período">
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="primary" className="h-11">
              Filtrar
            </Button>
          </form>

          <LeadsManager leads={data.leads} canEdit={canEdit} />

          {totalPages > 1 && (
            <nav className="flex items-center justify-between text-sm" aria-label="Paginação">
              <p className="text-muted-foreground">
                Página {page} de {totalPages} · {data.total} leads
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/leads?${buildQuery({ page: String(page - 1) })}`}>
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/leads?${buildQuery({ page: String(page + 1) })}`}>
                      Seguinte <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
