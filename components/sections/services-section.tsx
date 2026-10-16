"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AppWindow,
  ArrowUpRight,
  Building2,
  Globe,
  Palette,
  Rocket,
  Share2,
  type LucideIcon,
} from "lucide-react";

import { SERVICES, type ServiceKey } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const ICONS: Record<ServiceKey, LucideIcon> = {
  website: Globe,
  webapp: AppWindow,
  landing: Rocket,
  social: Share2,
  identidade: Palette,
  empresa: Building2,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function ServicesSection() {
  return (
    <section id="servicos" className="bg-white py-20 lg:py-28">
      <div className="container-padded">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">O que fazemos</p>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl font-bold text-navy-700 sm:text-5xl">
              Da presença online às redes sociais, tudo no mesmo sítio
            </h2>
          </div>
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground lg:justify-self-end">
            Websites, aplicações e landing pages desenhados pela Kodeza. Gestão de redes sociais e
            anúncios pela 3M. Um só parceiro, uma só conversa.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service, index) => {
            const Icon = ICONS[service.key];
            const dark = service.key === "webapp";
            return (
              <motion.div key={service.key} variants={item} className={cn(index === 0 && "lg:col-span-2")}>
                <Link
                  href="/servicos"
                  className={cn(
                    "group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1",
                    dark
                      ? "border-navy-700 bg-navy-800 text-white shadow-card hover:shadow-glow"
                      : "border-border bg-secondary/60 hover:border-primary-300 hover:bg-white hover:shadow-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      dark ? "bg-primary-500 text-white" : "bg-white text-primary-600 shadow-soft",
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className={cn("mt-6 font-display text-xl font-bold", dark ? "text-white" : "text-navy-700")}>
                    {service.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2.5 max-w-md text-sm leading-relaxed",
                      dark ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {service.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <p className={cn("text-sm font-semibold", dark ? "text-accent-400" : "text-primary-700")}>
                      A partir de {service.from}
                    </p>
                    <ArrowUpRight
                      className={cn(
                        "h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                        dark ? "text-white/60" : "text-navy-300",
                      )}
                    />
                  </div>
                  {index === 0 && (
                    <div
                      className="pointer-events-none absolute -bottom-10 -right-10 hidden h-48 w-48 rounded-full bg-primary-200/50 blur-2xl sm:block"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
