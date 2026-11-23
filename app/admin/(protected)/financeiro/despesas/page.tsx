import type { Metadata } from "next";
import type { ExpenseCategory, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAccountOptions } from "@/lib/accounts";
import { EXPENSE_LABELS } from "@/lib/expense-labels";
import { rangeWhere, resolveRange } from "@/lib/date-range";
import { firstParam, hasKey, paginate, parsePage } from "@/lib/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { StatusChips } from "@/components/admin/status-chips";
import { FinanceTabs } from "@/components/admin/financeiro/finance-tabs";
import { ExpensesTable } from "@/components/admin/financeiro/expenses-table";
import type { ExpenseRow } from "@/components/admin/financeiro/expense-form-dialog";

export const metadata: Metadata = {
  title: "Despesas | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DespesasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = firstParam(params.q).trim();
  const rawEstado = firstParam(params.estado);
  const estado = hasKey(EXPENSE_LABELS, rawEstado) ? (rawEstado as ExpenseCategory) : "";

  const range = resolveRange(params, "ano");
  const filter = rangeWhere(range);
  const dateWhere: Prisma.ExpenseWhereInput = filter ? { date: filter } : {};

  const where: Prisma.ExpenseWhereInput = {
    ...dateWhere,
    ...(estado ? { category: estado } : {}),
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { supplier: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const total = await prisma.expense.count({ where });
  const { page, totalPages, skip, take } = paginate(total, parsePage(params.page));

  const [expenses, sum, grouped, accounts, projects] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { account: { select: { name: true } }, project: { select: { title: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
    prisma.expense.groupBy({ by: ["category"], where: dateWhere, _count: { _all: true } }),
    getAccountOptions(),
    prisma.project.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const counts = new Map<string, number>(grouped.map((g) => [g.category, g._count._all]));
  const chips = [
    { value: "", label: "Todas", count: grouped.reduce((s, g) => s + g._count._all, 0) },
    ...(Object.keys(EXPENSE_LABELS) as ExpenseCategory[])
      .filter((c) => (counts.get(c) ?? 0) > 0 || c === estado)
      .map((c) => ({ value: c, label: EXPENSE_LABELS[c], count: counts.get(c) ?? 0 })),
  ];

  const rows: ExpenseRow[] = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    date: e.date,
    category: e.category,
    supplier: e.supplier,
    notes: e.notes,
    accountId: e.accountId,
    accountName: e.account?.name ?? null,
    projectId: e.projectId,
    projectTitle: e.project?.title ?? null,
  }));

  return (
    <div className="mx-auto max-w-[1400px] p-5 sm:p-6 lg:p-10">
      <PageHeader title="Financeiro" description="O que facturou, o que recebeu, o que gastou — e onde está o dinheiro.">
        <DateRangeFilter current={range} />
      </PageHeader>
      <FinanceTabs />

      <StatusChips basePath="/admin/financeiro/despesas" chips={chips} current={estado} params={{ q, ...range.params }} />
      <ExpensesTable
        expenses={rows}
        accounts={accounts}
        projects={projects}
        q={q}
        estado={estado}
        range={range.params}
        page={page}
        totalPages={totalPages}
        total={total}
        filteredTotal={Number(sum._sum.amount ?? 0)}
      />
    </div>
  );
}
