import type { Metadata } from "next";
import { Compass, Heart, ShieldCheck, Sparkles } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { StatsBand } from "@/components/sections/stats-band";
import { CtaSection } from "@/components/sections/cta-section";
import { TeamGrid } from "@/components/sections/team-grid";
import { ValueCard } from "@/components/sections/value-card";
import ValoresAbout from "./valoresAbout";

export const metadata: Metadata = {
  title: "Sobre | 3M Agência de Marketing",
  description:
    "Conheça a história, os valores e o time por trás da 3M — a agência que transforma ideias em resultados reais.",
};

const VALUES = [
  {
    icon: Compass,
    title: "Propósito claro",
    description:
      "Cada estratégia parte de um objetivo de negócio real, não de métricas de vaidade.",
  },
  {
    icon: Heart,
    title: "Compromisso com resultado",
    description:
      "Medimos sucesso pelo impacto que geramos no crescimento do seu negócio.",
  },
  {
    icon: ShieldCheck,
    title: "Transparência",
    description:
      "Relatórios claros e comunicação direta, sem promessas vazias ou jargão vazio.",
  },
  {
    icon: Sparkles,
    title: "Criatividade orientada a dados",
    description:
      "Ideias ousadas, testadas e refinadas com base em dados reais de performance.",
  },
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre a 3M"
        title="Marketing que entende o seu negócio, do jeito que ele merece"
        description="Somos uma agência formada por estrategistas, criativos e especialistas em performance que acreditam que marketing bom é aquele que se traduz em crescimento real."
      />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-5">Nossa história</p>
            <h2 className="text-balance font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">
              Nascemos para simplificar o marketing que funciona
            </h2>
            <p className="mt-5 text-balance leading-relaxed text-muted-foreground">
              Há mais de 3 anos ajudamos marcas de todos os tamanhos a sair
              do achismo e construir estratégias de marketing guiadas por
              dados. Começamos como um time pequeno, obcecado por
              performance, e crescemos sem perder o que sempre nos
              diferenciou: proximidade com o cliente e foco absoluto em
              resultado.
            </p>
            <p className="mt-4 text-balance leading-relaxed text-muted-foreground">
              Hoje somos parceiros de crescimento de mais de 29 marcas,
              unindo estratégia, criatividade e tecnologia em um só lugar —
              para que você não precise coordenar cinco fornecedores
              diferentes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 rounded-2xl bg-navy-700 p-7 text-white shadow-card">
              <p className="font-display text-3xl font-extrabold">3+ anos</p>
              <p className="mt-1 text-sm text-white/70">
                construindo estratégias de marketing orientadas a resultado.
              </p>
            </div>
            <div className="rounded-2xl bg-primary-50 p-6">
              <p className="font-display text-2xl font-extrabold text-primary-600">29+</p>
              <p className="mt-1 text-sm text-navy-600/80">clientes ativos</p>
            </div>
            <div className="rounded-2xl bg-accent-50 p-6">
              <p className="font-display text-2xl font-extrabold text-accent-600">79+</p>
              <p className="mt-1 text-sm text-navy-600/80">projetos entregues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos valores */}
      <ValoresAbout />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mx-auto justify-center">Quem faz acontecer</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">
              O time por trás dos resultados
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
