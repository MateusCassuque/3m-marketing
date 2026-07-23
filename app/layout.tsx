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
    <html lang="pt-Ao" className={`${sora.variable} ${inter.variable}`}>
      <head>
        {/* <link rel="icon" href={'/placeholder.png'} /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a498f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <meta name="author" content="Mateus Cassuque" />
        <meta name="designer" content="Mateus Cassuque" />
        <meta name="copyright" content="© 2025 Mateus Cassuque" />

      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ContactDialog />
      </body>
    </html>
  )
}
