import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import { ContactInfo } from "@/components/sections/contact-info";

export const metadata: Metadata = {
  title: "Contato | 3M Agência de Marketing",
  description:
    "Fale com a 3M Agência de Marketing. Envie uma mensagem, confira nosso endereço no mapa e veja nossos horários de atendimento.",
};

const MAPS_QUERY = encodeURIComponent("Av. Paulista, 1374, Bela Vista, São Paulo - SP");
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Vamos construir algo grande juntos?"
        description="Preencha o formulário com detalhes do seu projeto ou venha nos visitar — respondemos rápido, prometido."
      />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-padded grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="rounded-3xl border border-border bg-white p-7 shadow-soft sm:p-9">
            <h2 className="font-display text-2xl font-extrabold text-navy-700">
              Envie uma mensagem
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Conte um pouco sobre seu projeto — respondemos em até 24h úteis.
            </p>
            <ContactForm className="mt-7" />
          </div>

          <ContactInfo />
        </div>
      </section>

      <section className="bg-muted/40 pb-20 lg:pb-24">
        <div className="container-padded">
          <div className="mb-8 text-center">
            <p className="eyebrow mx-auto justify-center">Onde estamos</p>
            <h2 className="mt-4 text-balance font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
              Sambizanga, Luanda, Angola
            </h2>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
            <iframe
              title="Localização da 3M Agência de Marketing no Google Maps"
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
