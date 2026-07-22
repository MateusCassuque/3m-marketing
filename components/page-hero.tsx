"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}

/**
 * Banner padrão das páginas internas (Sobre, Serviços, Portfólio, Blog,
 * Contato) — mesma linguagem visual do hero da home (gradiente navy→teal),
 * só que compacto, para orientar quem chegou por uma rota específica.
 */
export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient py-20 lg:py-24">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-4 left-8 hidden h-32 w-32 text-white/20 sm:block"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-dot-grid opacity-60" />
      </div>

      <div className="container-padded relative text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-400"
        >
          <span className="h-[2px] w-6 bg-accent-400" />
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mx-auto mt-4 max-w-2xl text-balance font-display text-4xl font-extrabold text-white sm:text-5xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-balance text-white/80"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
