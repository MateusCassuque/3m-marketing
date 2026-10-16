import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { prisma } from "@/lib/prisma";

const SERVICE_MAP = {
  website: "WEBSITE",
  webapp: "WEBAPP",
  "landing-page": "LANDING_PAGE",
  "midias-sociais": "MIDIAS_SOCIAIS",
  "identidade-visual": "IDENTIDADE_VISUAL",
  "registo-empresa": "REGISTO_EMPRESA",
  outro: "OUTRO",
} as const;

// Limite simples por IP (em memória): 5 mensagens por 10 minutos.
// Em ambientes serverless cada instância tem o seu contador — serve como
// travão básico contra spam; para algo mais forte use um serviço dedicado.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function tooManyRequests(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_HITS;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooManyRequests(ip)) {
    return NextResponse.json(
      { message: "Recebemos muitas mensagens deste dispositivo. Tente novamente dentro de alguns minutos." },
      { status: 429 },
    );
  }

  const json = await request.json().catch(() => null);

  if (!json) {
    return NextResponse.json(
      { message: "Não foi possível ler os dados enviados." },
      { status: 400 },
    );
  }

  const parsed = contactFormSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Verifique os campos destacados e tente novamente.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { name, email, phone, service, message } = parsed.data;

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        service: SERVICE_MAP[service],
        message,
      },
    });

    return NextResponse.json(
      { message: "Mensagem enviada com sucesso!", id: lead.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("[contact] falha ao salvar lead", error);
    return NextResponse.json(
      { message: "Não foi possível enviar sua mensagem agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
