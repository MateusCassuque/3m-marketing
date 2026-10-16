import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { UsersManager } from "@/components/admin/utilizadores/users-manager";

export const metadata: Metadata = {
  title: "Utilizadores | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const users = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader
        title="Utilizadores"
        description="Quem pode entrar no painel. Os editores só consultam; os administradores gerem tudo."
      />
      <UsersManager
        currentUserId={session.user.id ?? ""}
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      />
    </div>
  );
}
