"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/use-ui-store";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

export function HeroSection() {
  const openContact = useUIStore((state) => state.openContact);

  return (
    <section id="inicio" className="relative overflow-hidden bg-white pb-24 pt-14 lg:pb-32 lg:pt-20">
      {/* Decorative dot grid, bottom-left */}
      <div
        className="pointer-events-none absolute bottom-10 left-6 hidden h-32 w-32 text-primary-200 lg:block"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-dot-grid opacity-70" />
      </div>

      {/* Decorative blob, top-left */}
      <div
        className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary-100 via-primary-50 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="container-padded relative grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-10">
        {/* Copy */}
        <motion.div initial="hidden" animate="show" className="relative z-10">
          <motion.p variants={fadeUp} custom={0} className="eyebrow mb-5">
            Agência de Marketing
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="text-balance font-display text-4xl font-extrabold leading-[1.1] text-navy-700 sm:text-5xl lg:text-[3.4rem]"
          >
            Transformamos ideias em{" "}
            <span className="text-primary-500">resultados</span> reais.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mt-6 max-w-md text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Estratégias inteligentes, criatividade sem limites e foco em
            resultados para impulsionar o crescimento da sua marca.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={0.3}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button variant="primary" size="lg" asChild>
              <a href="#servicos">
                Nossos serviços
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={openContact}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
                <Play className="h-3 w-3 fill-current" />
              </span>
              Ver como funciona
            </Button>
          </motion.div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-[4/3] w-full max-w-lg lg:max-w-none"
        >
          {/* Backdrop shape */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-brand-gradient opacity-95" />
          <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />

          {/* Floating target badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 top-6 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-card sm:-left-6"
          >
            <Target className="h-7 w-7 text-primary-500" />
          </motion.div>

          {/* Abstract "team at laptop" mark */}
          <div className="absolute inset-x-10 bottom-10 top-10 flex items-center justify-center">
            <div className="relative h-full w-full max-w-xs rounded-3xl border border-white/25 bg-white/10 backdrop-blur-sm">
              <div className="absolute left-1/2 top-1/2 h-3/5 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 shadow-2xl">
                <div className="flex h-8 items-center gap-1.5 rounded-t-2xl bg-navy-100 px-3">
                  <span className="h-2 w-2 rounded-full bg-accent-500" />
                  <span className="h-2 w-2 rounded-full bg-primary-300" />
                  <span className="h-2 w-2 rounded-full bg-navy-300" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="h-2.5 w-3/4 rounded-full bg-navy-100" />
                  <div className="h-2.5 w-1/2 rounded-full bg-navy-100" />
                  <div className="mt-3 h-16 rounded-lg bg-gradient-to-tr from-primary-50 to-accent-50" />
                </div>
              </div>
            </div>
          </div>

          {/* Orange growth arrow */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 400 300"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="heroArrow" x1="40" y1="230" x2="360" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F5821F" />
                <stop offset="1" stopColor="#FBBF77" />
              </linearGradient>
            </defs>
            <path
              d="M40 230 C 140 210, 220 150, 330 75"
              stroke="url(#heroArrow)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M300 60 L335 72 L322 108"
              stroke="url(#heroArrow)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

          {/* Floating result card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute -bottom-6 -right-4 z-20 w-52 rounded-2xl bg-white p-4 shadow-card sm:-right-8 sm:w-56"
          >
            <p className="text-xs font-medium leading-snug text-muted-foreground">
              Resultados que <span className="font-bold text-navy-700">geram crescimento</span>
            </p>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-display text-3xl font-extrabold text-navy-700">+127%</span>
              <TrendingUp className="mb-1 h-6 w-6 text-primary-500" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
