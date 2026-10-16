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
    <div className="min-h-screen bg-[#F3F6FB] md:flex">
      <AdminSidebar
        userName={session.user.name ?? "Administrador"}
        userEmail={session.user.email ?? ""}
        isAdmin={session.user.role === "ADMIN"}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
