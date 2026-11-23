import { prisma } from "@/lib/prisma";

export interface AccountSummary {
  id: string;
  name: string;
  bankName: string | null;
  accountNumber: string | null;
  notes: string | null;
  active: boolean;
  openingBalance: number;
  /** Total recebido (facturas pagas para esta conta), desde sempre. */
  received: number;
  /** Total gasto (despesas saídas desta conta), desde sempre. */
  spent: number;
  /** Saldo actual = saldo inicial + recebido − gasto. */
  balance: number;
  movements: number;
}

/** Versão leve, para escolher a conta num formulário. */
export interface AccountOption {
  id: string;
  name: string;
  bankName: string | null;
  accountNumber: string | null;
  balance: number;
}

export async function getAccountSummaries(options: { includeInactive?: boolean } = {}): Promise<AccountSummary[]> {
  const [accounts, received, spent] = await Promise.all([
    prisma.account.findMany({
      where: options.includeInactive ? {} : { active: true },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    prisma.invoice.groupBy({
      by: ["accountId"],
      where: { status: "PAGA", accountId: { not: null } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.expense.groupBy({
      by: ["accountId"],
      where: { accountId: { not: null } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const receivedBy = new Map(received.map((r) => [r.accountId, r]));
  const spentBy = new Map(spent.map((s) => [s.accountId, s]));

  return accounts.map((account) => {
    const rec = receivedBy.get(account.id);
    const exp = spentBy.get(account.id);
    const opening = Number(account.openingBalance);
    const receivedTotal = Number(rec?._sum.amount ?? 0);
    const spentTotal = Number(exp?._sum.amount ?? 0);

    return {
      id: account.id,
      name: account.name,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      notes: account.notes,
      active: account.active,
      openingBalance: opening,
      received: receivedTotal,
      spent: spentTotal,
      balance: Math.round((opening + receivedTotal - spentTotal) * 100) / 100,
      movements: (rec?._count._all ?? 0) + (exp?._count._all ?? 0),
    };
  });
}

export const toAccountOption = (a: AccountSummary): AccountOption => ({
  id: a.id,
  name: a.name,
  bankName: a.bankName,
  accountNumber: a.accountNumber,
  balance: a.balance,
});

/** Contas activas, prontas para os formulários (com o saldo actual). */
export async function getAccountOptions(): Promise<AccountOption[]> {
  return (await getAccountSummaries()).map(toAccountOption);
}
