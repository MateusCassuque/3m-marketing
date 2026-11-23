import type { Metadata } from "next";

import { getAccountSummaries } from "@/lib/accounts";
import { PageHeader } from "@/components/admin/page-header";
import { FinanceTabs } from "@/components/admin/financeiro/finance-tabs";
import { AccountsManager } from "@/components/admin/financeiro/accounts-manager";

export const metadata: Metadata = {
  title: "Contas | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContasPage() {
  const accounts = await getAccountSummaries({ includeInactive: true });

  return (
    <div className="mx-auto max-w-[1400px] p-5 sm:p-6 lg:p-10">
      <PageHeader
        title="Financeiro"
        description="Contas bancárias, carteiras digitais (como o PayPay) e caixa. O saldo sobe com o que recebe e desce com o que gasta."
      />
      <FinanceTabs />
      <AccountsManager accounts={accounts} />
    </div>
  );
}
