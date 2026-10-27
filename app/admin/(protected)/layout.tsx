import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      userName={session.user.name ?? "Administrador"}
      userEmail={session.user.email ?? ""}
      userId={session.user.id}
      isAdmin={session.user.role === "ADMIN"}
    >
      {children}
    </AdminShell>
  );
}
