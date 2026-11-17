import { NextResponse } from "next/server";

import { runRecurringBilling } from "@/lib/recurring-billing";
import { broadcastNotificationsChanged } from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Emite as facturas recorrentes que já venceram. Chamado todos os dias pelo cron
 * da Vercel (vercel.json), que envia `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const created = await runRecurringBilling();
  if (created > 0) broadcastNotificationsChanged("recurring");

  return NextResponse.json({ created });
}
