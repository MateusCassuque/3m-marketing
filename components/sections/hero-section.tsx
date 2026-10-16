"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroK } from "@/components/three/hero-k";
import { PROJECTS } from "@/lib/site-data";
import { useUIStore } from "@/store/use-ui-store";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
};

const FACTS = ["Domínio e hospedagem grátis", "Preços em Kwanzas", "Suporte depois da entrega"];

export function HeroSection() {
  const openContact = useUIStore((state) => state.openContact);
  const names = PROJECTS.map((p) => p.name);

  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-hero-night text-white">
      <div className="bg-grid-lines pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="container-padded grid min-h-[calc(100svh-72px)] grid-cols-1 items-center gap-6 pb-24 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:pb-28 lg:pt-6">
        <motion.div initial="hidden" animate="show" className="relative z-10 max-w-xl">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/80 backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-accent-500" />
            Desenvolvimento web em Luanda
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={0.08}
            className="mt-6 text-balance font-display text-[2.6rem] font-bold leading-[1.04] sm:text-6xl lg:text-[4.1rem]"
          >
            Websites e aplicações que fazem o seu negócio vender.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={0.18}
            className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-white/70 sm:text-lg"
          >
            A Kodeza cria sites, landing pages e sistemas com painel de gestão para empresas
            angolanas. Depois do lançamento, a 3M cuida das suas redes sociais.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={0.28}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button variant="accent" size="lg" onClick={openContact}>
              Pedir proposta
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link href="/portfolio">Ver trabalhos</Link>
            </Button>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            custom={0.38}
            className="mt-9 flex flex-col gap-2.5 text-sm text-white/70 sm:flex-row sm:flex-wrap sm:gap-x-6"
          >
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-300" strokeWidth={2.5} />
                {fact}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-[5/4] w-full max-w-xl lg:max-w-none lg:aspect-auto lg:h-[640px]"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/25 blur-[90px]"
            aria-hidden="true"
          />
          <HeroK className="absolute inset-0" />
        </motion.div>
      </div>

      {/* Faixa de projectos recentes */}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-navy-950/60 backdrop-blur">
        <div className="relative flex overflow-hidden py-4" aria-label="Projectos recentes">
          <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
            {[...names, ...names].map((name, i) => (
              <span key={i} className="whitespace-nowrap font-display text-sm font-semibold text-white/45">
                {name}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12" aria-hidden="true">
            {[...names, ...names].map((name, i) => (
              <span key={i} className="whitespace-nowrap font-display text-sm font-semibold text-white/45">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
