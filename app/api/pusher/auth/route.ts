import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ADMINS_CHANNEL, getPusher, userChannel } from "@/lib/realtime";

export const dynamic = "force-dynamic";

/**
 * Autoriza a subscrição dos canais privados. Só utilizadores com sessão do painel
 * entram, e cada um apenas no canal partilhado e no seu próprio canal.
 */
export async function POST(request: Request) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const pusher = getPusher();
  if (!pusher) {
    return new NextResponse("Tempo real não configurado.", { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const socketId = form?.get("socket_id");
  const channel = form?.get("channel_name");

  if (typeof socketId !== "string" || typeof channel !== "string") {
    return new NextResponse("Pedido inválido.", { status: 400 });
  }

  const allowed = channel === ADMINS_CHANNEL || channel === userChannel(adminId);
  if (!allowed) {
    return new NextResponse("Canal não permitido.", { status: 403 });
  }

  return NextResponse.json(pusher.authorizeChannel(socketId, channel));
}
