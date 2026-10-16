"use client";

import { motion } from "framer-motion";

import { PROCESS } from "@/lib/site-data";

export function ProcessSteps() {
  return (
    <div className="container-padded">
      <div className="max-w-2xl">
        <p className="eyebrow">Como trabalhamos</p>
        <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-5xl">
          Do primeiro contacto ao site no ar
        </h2>
      </div>

      <ol className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-primary-300 via-primary-400 to-accent-400 lg:block"
          aria-hidden="true"
        />
        {PROCESS.map((step, index) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-700 font-display text-lg font-bold text-white shadow-soft">
              {index + 1}
            </span>
            <h3 className="mt-5 font-display text-lg font-bold text-navy-700">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
