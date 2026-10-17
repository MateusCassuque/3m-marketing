import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { FaqList } from "@/components/sections/faq-list";
import { CtaSection } from "@/components/sections/cta-section";
import { FAQ_GROUPS } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description:
    "Preços, prazos, domínio e hospedagem, formas de pagamento e redes sociais: respostas às dúvidas mais comuns sobre os serviços da Kodeza e da 3M.",
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="Perguntas frequentes"
        title="Dúvidas sobre o seu site ou as suas redes sociais?"
        description="Reunimos as respostas às perguntas mais comuns sobre preços, pagamento e o que cada serviço inclui."
      />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded">
          <FaqList />
        </div>
      </section>

      <CtaSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
