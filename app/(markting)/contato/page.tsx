import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import { ContactInfo } from "@/components/sections/contact-info";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Fale com a Kodeza e a 3M. Peça uma proposta para o seu website, aplicação web ou gestão de redes sociais. Luanda, Angola.",
};

const MAPS_QUERY = encodeURIComponent("Luanda, Angola");
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Vamos construir o seu próximo projecto?"
        description="Conte-nos o que precisa e enviamos uma proposta em Kwanzas. Respondemos em até 24 horas úteis."
      />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="rounded-3xl border border-border bg-white p-7 shadow-soft sm:p-9">
            <h2 className="font-display text-2xl font-bold text-navy-700">Envie uma mensagem</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quanto mais detalhes, melhor a proposta: tipo de site, prazo e referências.
            </p>
            <ContactForm className="mt-7" />
          </div>

          <ContactInfo />
        </div>
      </section>

      <section className="bg-secondary/70 pb-20 pt-16 lg:pb-24">
        <div className="container-padded">
          <div className="mb-8">
            <p className="eyebrow">Onde estamos</p>
            <h2 className="mt-4 font-display text-2xl font-bold text-navy-700 sm:text-3xl">Luanda, Angola</h2>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
            <iframe
              title="Localização da Kodeza e 3M no Google Maps"
              src={MAPS_EMBED_SRC}
              width="100%"
              height="420"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[320px] w-full sm:h-[420px]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
