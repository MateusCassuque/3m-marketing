import Link from "next/link"
import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/logo"

const SERVICE_LINKS = [
  { label: "Estratégia", href: "/servicos#estrategia" },
  { label: "Criatividade", href: "/servicos#criatividade" },
  { label: "Gestão de Tráfego", href: "/servicos#trafego" },
  { label: "Mídias Sociais", href: "/servicos#midias-sociais" },
  { label: "Branding", href: "/servicos#branding" },
]

const COMPANY_LINKS = [
  { label: "Sobre nós", href: "/sobre" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
]

export function SiteFooter() {
  return (
    <footer className="bg-navy-700 text-white">
      <div className="container-padded grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Estratégias inteligentes, criatividade sem limites e foco em
            resultados para impulsionar o crescimento da sua marca.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary-500"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary-500"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Serviços
          </h4>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Empresa
          </h4>
          <ul className="mt-4 space-y-2.5">
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Contato
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary-300" />
              geral@3magencia.site
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary-300" />
              (+244) 953 951 694 / 935 044 500
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
              Sambizanga, Luanda, Angola
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-padded flex flex-col items-center justify-center gap-2 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} 3M Agência de Marketing. Todos os direitos reservados.</p>
          <Link href="/dashboard" className="transition-colors hover:text-white/80">
            Painel interno
          </Link>
        </div>
      </div>
    </footer>
  )
}
