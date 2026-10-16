"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CubesBackdrop } from "@/components/three/cubes-backdrop";
import { COMPANY } from "@/lib/site-data";
import { useUIStore } from "@/store/use-ui-store";

export function CtaSection() {
  const openContact = useUIStore((state) => state.openContact);

  return (
    <section className="relative isolate overflow-hidden bg-hero-night py-24 text-white lg:py-32">
      <CubesBackdrop className="absolute inset-0 -z-10" />
      <div className="bg-grid-lines pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      <div className="container-padded relative text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-balance font-display text-4xl font-bold leading-[1.08] sm:text-6xl"
        >
          O seu projecto pode ser o próximo.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/70"
        >
          Do website à gestão das redes sociais, criamos a solução digital certa para o seu
          negócio. Conte-nos a ideia e enviamos uma proposta.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button variant="accent" size="lg" onClick={openContact}>
            Pedir proposta
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline-light" size="lg" asChild>
            <a href={COMPANY.whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" />
              Falar por WhatsApp
            </a>
          </Button>
        </motion.div>
        <p className="mt-6 text-sm text-white/55">
          Ou envie uma mensagem detalhada na{" "}
          <Link href="/contato" className="font-semibold text-white underline-offset-4 hover:underline">
            página de contacto
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
