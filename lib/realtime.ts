import { after } from "next/server";
import Pusher from "pusher";

/**
 * Tempo real com Pusher Channels.
 *
 * Os eventos NÃO levam dados — só avisam "as notificações mudaram". Cada browser
 * volta então a pedir `/api/admin/notifications` com a sua própria sessão, por isso
 * nunca circula informação de clientes ou facturas pelo Pusher.
 *
 * Se as variáveis de ambiente não estiverem definidas, tudo isto é ignorado em
 * silêncio e o painel continua a funcionar com actualização periódica.
 */

/** Canal partilhado por todos os utilizadores do painel (dados que mudaram). */
export const ADMINS_CHANNEL = "private-admins";
/** Canal de cada utilizador (ex.: marcou como lido noutro dispositivo). */
export const userChannel = (adminId: string) => `private-user-${adminId}`;
export const CHANGED_EVENT = "notifications:changed";

let cached: Pusher | null | undefined;

export function getPusher(): Pusher | null {
  if (cached !== undefined) return cached;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  cached =
    appId && key && secret && cluster
      ? new Pusher({ appId, key, secret, cluster, useTLS: true })
      : null;
  return cached;
}

async function send(channels: string[], reason: string) {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(channels, CHANGED_EVENT, { reason, at: Date.now() });
  } catch (error) {
    // Nunca deve estragar a operação principal (criar factura, etc.).
    console.error("[realtime] não foi possível enviar o evento", error);
  }
}

/** Avisa todos os painéis abertos de que facturas/pedidos mudaram. Corre depois de responder ao utilizador. */
export function broadcastNotificationsChanged(reason = "data") {
  after(() => send([ADMINS_CHANNEL], reason));
}

/** Avisa só os dispositivos de um utilizador (estado "lido"). */
export function notifyUserNotificationsChanged(adminId: string) {
  after(() => send([userChannel(adminId)], "read"));
}
