import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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
    <div className="flex min-h-[calc(100vh-0px)] bg-muted/40">
      <AdminSidebar
        userName={session.user.name ?? "Administrador"}
        userEmail={session.user.email ?? ""}
      />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
