"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AppWindow,
  ArrowUpRight,
  Building2,
  FileCheck2,
  Globe,
  Palette,
  Plane,
  Rocket,
  Share2,
  Stamp,
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
  visto: Stamp,
  bilhetes: Plane,
  passaporte: FileCheck2,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const priceText = (from?: string) => (from && /^\d/.test(from) ? `A partir de ${from}` : (from ?? ""));

/** Cartão com um "foco de luz" que segue o cursor. */
function ServiceCard({
  service,
  tone,
  featured,
}: {
  service: (typeof SERVICES)[number];
  tone: "light" | "dark";
  featured?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const Icon = ICONS[service.key];
  const dark = tone === "dark";

  const onMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <Link
      ref={ref}
      href="/servicos"
      onPointerMove={onMove}
      className={cn(
        "group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1",
        dark
          ? "border-white/10 bg-navy-800 text-white shadow-card hover:border-primary-400/40 hover:shadow-glow"
          : "border-border bg-secondary/60 hover:border-primary-300 hover:bg-white hover:shadow-card",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), ${
            dark ? "rgba(0,152,220,0.22)" : "rgba(0,152,220,0.10)"
          }, transparent 70%)`,
        }}
      />
      <span
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-2xl",
          dark ? "bg-primary-500 text-white" : "bg-white text-primary-600 shadow-soft",
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className={cn("relative mt-6 font-display text-xl font-bold", dark ? "text-white" : "text-navy-700")}>
        {service.title}
      </h3>
      <p className={cn("relative mt-2.5 max-w-md text-sm leading-relaxed", dark ? "text-white/70" : "text-muted-foreground")}>
        {service.description}
      </p>
      <div className="relative mt-auto flex items-center justify-between pt-6">
        <p className={cn("text-sm font-semibold", dark ? "text-accent-400" : "text-primary-700")}>{priceText(service.from)}</p>
        <ArrowUpRight
          className={cn(
            "h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
            dark ? "text-white/60" : "text-navy-300",
          )}
        />
      </div>
      {featured && (
        <div
          className="pointer-events-none absolute -bottom-12 -right-12 hidden h-48 w-48 rounded-full sm:block"
          style={{ background: "radial-gradient(circle, rgba(158,221,248,0.55), transparent 70%)" }}
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

export function ServicesSection() {
  const digital = SERVICES.filter((s) => s.group === "digital");
  const assessoria = SERVICES.filter((s) => s.group === "assessoria");

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
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {digital.map((service, index) => (
            <motion.div key={service.key} variants={item} className={cn(index === 0 && "lg:col-span-2")}>
              <ServiceCard service={service} tone={service.key === "webapp" ? "dark" : "light"} featured={index === 0} />
            </motion.div>
          ))}
        </motion.div>

        {/* Assessoria de viagens e documentos */}
        <div className="mt-20">
          <p className="eyebrow">Assessoria de viagens e documentos</p>
          <h3 className="mt-4 max-w-2xl text-balance font-display text-2xl font-bold text-navy-700 sm:text-4xl">
            Também tratamos de vistos, bilhetes e passaportes
          </h3>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {assessoria.map((service) => (
              <motion.div key={service.key} variants={item}>
                <ServiceCard service={service} tone="dark" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
