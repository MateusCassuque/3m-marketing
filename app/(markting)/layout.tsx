import type { Metadata } from "next"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactDialog } from "@/components/contact-dialog"

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
    <body>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <ContactDialog />
    </body>
  )
}
