"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-20">
      <div
        className="pointer-events-none absolute -left-32 -top-24 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-primary-100 via-primary-50 to-transparent blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-4 right-8 hidden h-28 w-28 text-primary-200 lg:block"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-dot-grid opacity-70" />
      </div>

      <div className="container-padded relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="eyebrow mx-auto justify-center">{eyebrow}</p>
          <h1 className="mt-4 text-balance font-display text-3xl font-extrabold text-navy-700 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
