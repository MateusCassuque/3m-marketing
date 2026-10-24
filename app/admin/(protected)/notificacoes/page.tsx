import type { Metadata } from "next";

import { auth } from "@/auth";
import { getNotifications } from "@/lib/notifications";
import { PageHeader } from "@/components/admin/page-header";
import { NotificationList } from "@/components/admin/notificacoes/notification-list";

export const metadata: Metadata = {
  title: "Notificações | Painel Kodeza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  const { items } = await getNotifications(session?.user?.id ?? "");

  return (
    <div className="p-5 sm:p-6 lg:p-10">
      <PageHeader
        title="Notificações"
        description="Cobranças por fazer, facturas pendentes e pedidos atrasados. Desaparecem sozinhas quando a situação se resolve."
      />
      <NotificationList initial={items} />
    </div>
  );
}
