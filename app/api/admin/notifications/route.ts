import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const payload = await getNotifications(session.user.id);
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[notifications] falhou", error);
    return NextResponse.json({ items: [], unread: 0 }, { status: 200 });
  }
}
