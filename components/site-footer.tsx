import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Serviços",
    links: ["Estratégia", "Criatividade", "Gestão de Tráfego", "Mídias Sociais", "Branding"],
  },
  {
    title: "Empresa",
    links: ["Sobre nós", "Portfólio", "Blog", "Carreiras"],
  },
];

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

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/70 transition-colors hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Contato
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary-300" />
              contato@3magencia.com.br
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary-300" />
              (11) 4000-0000
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-primary-300" />
              São Paulo, SP
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="container-padded text-center text-xs text-white/50">
          © {new Date().getFullYear()} 3M Agência de Marketing. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
