"use client";

import { motion } from "framer-motion";
import { Gauge, Globe2, HeartHandshake, Server, Sprout, Wallet, type LucideIcon } from "lucide-react";

import { ADVANTAGES } from "@/lib/site-data";

const ICONS: LucideIcon[] = [Globe2, Gauge, Sprout, Server, HeartHandshake, Wallet];

export function WhyUs() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-padded grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Porque a Kodeza & 3M</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-5xl">
            Uma equipa angolana, com o site a funcionar desde o primeiro dia
          </h2>
        </div>

        <ul className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
          {ADVANTAGES.map((adv, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.li
                key={adv.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                className="flex gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-navy-700">{adv.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{adv.text}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
