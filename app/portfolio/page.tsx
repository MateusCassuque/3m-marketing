import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { PortfolioGrid } from "@/components/sections/portfolio-grid";
import { CtaSection } from "@/components/sections/cta-section";

export const metadata: Metadata = {
  title: "Portfólio | 3M Agência de Marketing",
  description:
    "Conheça projetos reais de estratégia, criatividade, tráfego, mídias sociais e branding entregues pela 3M.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfólio"
        title="Projetos que geram resultado, não só peças bonitas"
        description="Uma amostra do que construímos junto com nossos clientes — filtre por área para ver casos específicos."
      />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded">
          <PortfolioGrid />
        </div>
      </section>

      <CtaSection />
    </>
  );
}
