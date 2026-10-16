import type { Metadata } from "next";
import { Compass, Handshake, ShieldCheck, Sparkles } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { StatsBand } from "@/components/sections/stats-band";
import { CtaSection } from "@/components/sections/cta-section";
import { TeamGrid } from "@/components/sections/team-grid";
import { Logo, Logo3M } from "@/components/logo";
import { COMPANY } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "A Kodeza é uma empresa angolana de desenvolvimento de websites e aplicações web. A 3M é a nossa unidade de marketing digital e gestão de redes sociais.",
};

const VALUES = [
  {
    icon: Compass,
    title: "Foco no que importa",
    description: "Cada site parte de um objectivo do negócio: vender, captar clientes ou organizar a gestão.",
  },
  {
    icon: ShieldCheck,
    title: "Desempenho e segurança",
    description: "Sites rápidos, seguros e preparados para crescer com a sua empresa.",
  },
  {
    icon: Handshake,
    title: "Proximidade",
    description: "Acompanhamento próximo antes, durante e depois da entrega do projecto.",
  },
  {
    icon: Sparkles,
    title: "Transparência",
    description: "Preços em Kwanzas, sem custos escondidos. Domínio e hospedagem incluídos.",
  },
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre nós"
        title="Tecnologia que transforma ideias em negócios online"
        description="Somos uma empresa angolana que cria websites e aplicações web. Com a 3M, também cuidamos da comunicação digital depois do lançamento."
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-padded grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Quem somos</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Uma só equipa para a presença online e para a comunicação digital
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
              A <strong className="text-navy-700">Kodeza</strong> é uma empresa angolana especializada
              em desenvolvimento de websites e aplicações web, criando soluções digitais que conectam
              e transformam negócios.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              A <strong className="text-navy-700">3M</strong> é a nossa unidade de marketing digital,
              dedicada a dar mais visibilidade e resultados através da gestão profissional de redes
              sociais. Juntas, oferecemos um serviço completo: da presença online à comunicação
              digital, sempre com foco em qualidade, desempenho e resultado.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              {COMPANY.legalName} · NIF {COMPANY.nif}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 flex items-center justify-center rounded-3xl bg-navy-800 p-10 shadow-card">
              <Logo variant="light" layout="stacked" className="h-36" />
            </div>
            <div className="rounded-3xl bg-primary-50 p-6">
              <Logo layout="mark" className="h-8" />
              <p className="mt-4 font-display text-lg font-bold text-navy-700">Kodeza</p>
              <p className="mt-1 text-sm text-navy-600/80">Websites, aplicações web e landing pages.</p>
            </div>
            <div className="rounded-3xl bg-accent-50 p-6">
              <Logo3M className="h-8" />
              <p className="mt-4 font-display text-lg font-bold text-navy-700">3M</p>
              <p className="mt-1 text-sm text-navy-600/80">Marketing digital e redes sociais.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/70 py-20 lg:py-24">
        <div className="container-padded">
          <div className="max-w-2xl">
            <p className="eyebrow">O que nos guia</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Como trabalhamos com cada cliente
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-3xl border border-border bg-white p-7 shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-navy-700">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mx-auto">A equipa</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              As pessoas por trás dos projectos
            </h2>
          </div>
          <TeamGrid />
        </div>
      </section>

      <StatsBand />
      <CtaSection />
    </>
  );
}
