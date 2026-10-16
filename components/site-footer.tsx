import Link from "next/link";
import { Instagram, Facebook, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Logo, Logo3M } from "@/components/logo";
import { COMPANY, NAV_LINKS, SERVICES } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-padded relative grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo variant="light" layout="stacked" className="h-28" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
            Websites, aplicações web e gestão de redes sociais para empresas angolanas que querem
            crescer online.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={COMPANY.whatsappHref}
              aria-label="WhatsApp"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary-500"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary-500"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary-500"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Serviços</h4>
          <ul className="mt-4 space-y-2.5">
            {SERVICES.map((service) => (
              <li key={service.key}>
                <Link
                  href="/servicos"
                  className="text-sm text-white/65 transition-colors hover:text-white"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Empresa</h4>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/65 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            <Logo3M className="h-6" />
            <span>Unidade de marketing digital e redes sociais</span>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold text-white">Contacto</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>
              <a href={COMPANY.phoneHref} className="flex items-center gap-2.5 hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-primary-300" />
                {COMPANY.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-primary-300" />
                {COMPANY.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
              {COMPANY.address}
            </li>
          </ul>
          <p className="mt-6 text-xs text-white/45">NIF {COMPANY.nif}</p>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-6">
        <div className="container-padded flex flex-col items-center justify-between gap-2 text-xs text-white/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Kodeza · 3M. Todos os direitos reservados.
          </p>
          <Link href="/admin" className="transition-colors hover:text-white/80">
            Painel interno
          </Link>
        </div>
      </div>
    </footer>
  );
}
