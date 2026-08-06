import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"

export async function GET(request: Request) {
    try {
        const password = hashPassword('Massuque1#')
        const admin = await prisma.admin.upsert({
            create: {
                email: '3mCassuque@3mvisa.site',
                passwordHash: password,
                name: 'Mateus Cassuque',
                role: 'ADMIN'
            },
            update: {
                email: '3mCassuque@3mvisa.site',
                passwordHash: password,
                name: 'Mateus Cassuque',
                role: 'ADMIN'
            },
            where: { email: '3mCassuque@3mvisa.site' }
        })

        return NextResponse.json(
            { message: "Admin is Ok!", id: admin.id },
            { status: 201 },
        )
    } catch (error) {
        console.error("[contact] falha ao salvar lead", error)
        return NextResponse.json(
            { message: "Não foi possível enviar sua mensagem agora. Tente novamente em instantes." },
            { status: 500 },
        )
    }
}
