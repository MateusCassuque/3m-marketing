import type { Metadata } from "next"
import { Sora, Inter } from "next/font/google"
import "./globals.css"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactDialog } from "@/components/contact-dialog"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "3M | Agência de Marketing — Transformamos ideias em resultados reais",
  description:
    "Estratégias inteligentes, criatividade sem limites e foco em resultados para impulsionar o crescimento da sua marca.",
  keywords: [
    "agência de marketing",
    "gestão de tráfego",
    "branding",
    "mídias sociais",
    "estratégia digital",
  ],
  openGraph: {
    title: "3M | Agência de Marketing",
    description:
      "Transformamos ideias em resultados reais. Estratégia, criatividade e performance para o crescimento da sua marca.",
    locale: "pt_BR",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ContactDialog />
      </body>
    </html>
  )
}
