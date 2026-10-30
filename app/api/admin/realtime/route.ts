import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPusher, userChannel, CHANGED_EVENT } from "@/lib/realtime";

export const dynamic = "force-dynamic";

/** Diz que variáveis do Pusher existem no servidor (nunca devolve os valores). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const env = {
    PUSHER_APP_ID: Boolean(process.env.PUSHER_APP_ID),
    NEXT_PUBLIC_PUSHER_KEY: Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY),
    NEXT_PUBLIC_PUSHER_CLUSTER: Boolean(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
    PUSHER_SECRET: Boolean(process.env.PUSHER_SECRET),
  };

  return NextResponse.json({
    env,
    missing: Object.entries(env)
      .filter(([, ok]) => !ok)
      .map(([name]) => name),
  });
}

/** Envia um evento de teste para o canal deste utilizador e devolve o resultado do Pusher. */
export async function POST() {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const pusher = getPusher();
  if (!pusher) {
    return NextResponse.json({ ok: false, error: "Variáveis do Pusher em falta no servidor." });
  }

  try {
    await pusher.trigger(userChannel(adminId), CHANGED_EVENT, { reason: "test", at: Date.now() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[realtime] teste falhou", error);
    return NextResponse.json({ ok: false, error: message });
  }
}
