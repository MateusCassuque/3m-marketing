import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { ClientsTable } from "@/components/admin/clientes/clients-table";

export const metadata: Metadata = {
  title: "Clientes | Painel 3M",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Clientes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre e gerencie os clientes vinculados a pedidos e faturas.
        </p>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
