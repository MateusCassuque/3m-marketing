import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { PortfolioGrid } from "@/components/sections/portfolio-grid";
import { CtaSection } from "@/components/sections/cta-section";
import { PROJECTS } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Portfólio",
  description:
    "Websites e aplicações web desenvolvidos pela Kodeza e 3M: formação, turismo, restauração, saúde, delivery, e-commerce e marketplace.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfólio"
        title="Projectos que já estão no ar"
        description={`${PROJECTS.length} sites e aplicações web desenvolvidos para empresas em Angola e Portugal. Clique num projecto para o visitar.`}
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
