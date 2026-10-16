import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.3mvisa.site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kodeza · 3M | Websites, aplicações web e marketing digital em Angola",
    template: "%s | Kodeza · 3M",
  },
  description:
    "A Kodeza cria websites e aplicações web para empresas angolanas. A 3M trata das suas redes sociais. Domínio e hospedagem incluídos, preços em Kwanzas.",
  keywords: [
    "criação de sites Angola",
    "desenvolvimento web Luanda",
    "aplicações web",
    "landing page",
    "gestão de redes sociais",
    "marketing digital Angola",
    "Kodeza",
    "3M",
  ],
  applicationName: "Kodeza · 3M",
  authors: [{ name: "Kodeza" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Kodeza · 3M | Tecnologia que transforma ideias",
    description:
      "Websites, aplicações web e gestão de redes sociais para empresas angolanas. Domínio e hospedagem incluídos.",
    locale: "pt_AO",
    type: "website",
    siteName: "Kodeza · 3M",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#04132E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-AO" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
