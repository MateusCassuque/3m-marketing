"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface PageHeroProps {
  /** Pequena etiqueta por cima do título (opcional). */
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const PIXELS = [
  { c: "#00AFEA", s: 22, x: "8%", y: "28%" },
  { c: "#0098DC", s: 14, x: "13%", y: "62%" },
  { c: "#FF7F0A", s: 10, x: "5%", y: "48%" },
  { c: "#5CC8F2", s: 16, x: "86%", y: "30%" },
  { c: "#FF7F0A", s: 12, x: "92%", y: "58%" },
  { c: "#1D4D99", s: 24, x: "80%", y: "66%" },
];

export function PageHero({ eyebrow, title, description, className, children }: PageHeroProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-hero-night py-20 text-white lg:py-28", className)}>
      <div className="bg-grid-lines pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      {PIXELS.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute hidden rounded-[4px] sm:block"
          style={{ background: p.c, width: p.s, height: p.s, left: p.x, top: p.y, opacity: 0.85 }}
          animate={{ y: [0, -10, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="container-padded relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          {eyebrow && <p className="eyebrow mx-auto text-primary-300">{eyebrow}</p>}
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">
              {description}
            </p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
