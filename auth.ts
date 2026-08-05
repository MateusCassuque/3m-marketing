import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"
import { loginSchema } from "@/lib/validations/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const admin = await prisma.admin.findUnique({ where: { email } })
        if (!admin) return null

        const isValid = await verifyPassword(password, admin.passwordHash)
        if (!isValid) return null

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
