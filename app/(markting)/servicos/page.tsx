import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { PricingPlans, PlanCard } from "@/components/sections/pricing-plans";
import { SocialPackages } from "@/components/sections/social-packages";
import { ProcessSteps } from "@/components/sections/process-steps";
import { CtaSection } from "@/components/sections/cta-section";
import { EXTRA_SERVICES, PAYMENT_OPTIONS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Serviços e preços",
  description:
    "Criação de sites, landing pages e aplicações web com domínio e hospedagem grátis, identidade visual, registo de empresas e gestão de redes sociais. Preços em Kwanzas.",
};

export default function ServicosPage() {
  return (
    <>
      <PageHero
        eyebrow="Serviços e preços"
        title="Escolha o plano ideal para o seu negócio"
        description="Websites, aplicações e redes sociais com preços em Kwanzas. Domínio e hospedagem gratuitos em todos os planos de criação de sites."
      />

      <section id="sites" className="scroll-mt-24 bg-white py-20 lg:py-24">
        <div className="container-padded">
          <div className="max-w-2xl">
            <p className="eyebrow">Criação de sites</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Do site de uma página ao sistema completo com facturação
            </h2>
          </div>
          <div className="mt-12">
            <PricingPlans />
          </div>
        </div>
      </section>

      <section id="mais-servicos" className="scroll-mt-24 bg-secondary/70 py-20 lg:py-24">
        <div className="container-padded">
          <div className="max-w-2xl">
            <p className="eyebrow">Mais serviços</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Para quem está a começar ou quer reforçar a imagem do negócio
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {EXTRA_SERVICES.map((service) => (
              <PlanCard key={service.id} plan={{ ...service, price: service.price }} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="redes-sociais"
        className="relative isolate scroll-mt-24 overflow-hidden bg-navy-800 py-20 text-white lg:py-24"
      >
        <div className="bg-grid-lines pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-padded">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary-300">3M · Gestão de redes sociais</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold sm:text-4xl">
              A sua empresa merece mais visibilidade e resultados
            </h2>
          </div>
          <div className="mt-12">
            <SocialPackages />
          </div>
        </div>
      </section>

      <section id="pagamento" className="scroll-mt-24 bg-white py-20 lg:py-24">
        <div className="container-padded">
          <div className="max-w-2xl">
            <p className="eyebrow">Formas de pagamento</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Escolha o que for mais confortável
            </h2>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PAYMENT_OPTIONS.map((option) => (
              <li key={option.title} className="rounded-3xl border border-border bg-secondary/50 p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-soft">
                  <CreditCard className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-navy-700">{option.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{option.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-secondary/70 py-20 lg:py-24">
        <ProcessSteps />
      </section>

      <CtaSection />
    </>
  );
}
