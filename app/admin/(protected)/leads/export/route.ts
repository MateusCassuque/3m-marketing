import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SERVICE_LABELS, STATUS_LABELS } from "@/lib/lead-labels";

export const dynamic = "force-dynamic";

/** Evita "injecção de fórmulas" quando o CSV é aberto no Excel. */
function cell(value: string | null | undefined) {
  let text = (value ?? "").replace(/\r?\n/g, " ").trim();
  if (/^[=+\-@\t]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("estado");
  const service = searchParams.get("servico");
  const q = searchParams.get("q")?.trim();
  const days = Number(searchParams.get("periodo"));

  const where: Prisma.LeadWhereInput = {};
  if (status && status in STATUS_LABELS) where.status = status as keyof typeof STATUS_LABELS;
  if (service && service in SERVICE_LABELS) where.service = service as keyof typeof SERVICE_LABELS;
  if (days > 0) where.createdAt = { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 5000 });

  const header = ["Data", "Nome", "E-mail", "Telefone", "Serviço", "Estado", "Mensagem", "Notas"];
  const rows = leads.map((lead) =>
    [
      lead.createdAt.toISOString().slice(0, 16).replace("T", " "),
      lead.name,
      lead.email,
      lead.phone,
      SERVICE_LABELS[lead.service],
      STATUS_LABELS[lead.status],
      lead.message,
      lead.notes,
    ]
      .map(cell)
      .join(";"),
  );

  // BOM + ";" como separador → abre correctamente no Excel em português.
  const csv = "\uFEFF" + [header.map(cell).join(";"), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
