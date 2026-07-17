import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { prisma } from "@/lib/prisma";

const SERVICE_MAP = {
  estrategia: "ESTRATEGIA",
  criatividade: "CRIATIVIDADE",
  trafego: "TRAFEGO",
  "midias-sociais": "MIDIAS_SOCIAIS",
  branding: "BRANDING",
  outro: "OUTRO",
} as const;

export async function POST(request: Request) {
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
