import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const bodySchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ keys: z.array(z.string().min(1).max(100)).min(1).max(200) }),
]);

export async function POST(request: Request) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Pedido inválido." }, { status: 400 });
  }

  const keys =
    "all" in parsed.data
      ? (await getNotifications(adminId)).items.filter((i) => !i.read).map((i) => i.key)
      : parsed.data.keys;

  if (keys.length > 0) {
    await prisma.notificationRead.createMany({
      data: keys.map((key) => ({ adminId, key })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(await getNotifications(adminId));
}
