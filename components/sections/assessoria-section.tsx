"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileCheck2, Plane, Stamp, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/site-data";
import { useUIStore } from "@/store/use-ui-store";

const ICONS: Record<string, LucideIcon> = { visto: Stamp, bilhetes: Plane, passaporte: FileCheck2 };

/** Assessoria de viagens e documentos (visto, bilhetes, passaporte) — preço sob consulta. */
export function AssessoriaSection() {
  const openContact = useUIStore((state) => state.openContact);
  const items = SERVICES.filter((s) => s.group === "assessoria");

  return (
    <section id="assessoria" className="scroll-mt-24 bg-white py-20 lg:py-24">
      <div className="container-padded">
        <div className="max-w-2xl">
          <p className="eyebrow">Assessoria de viagens e documentos</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-4xl">
            Vistos, bilhetes e passaportes, sem dores de cabeça
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            O valor depende de cada caso (país, tipo de visto, número de pessoas). Conte-nos o que precisa e enviamos um orçamento.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((service, i) => {
            const Icon = ICONS[service.key] ?? Stamp;
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col rounded-3xl border border-white/10 bg-navy-800 p-7 text-white shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold">{service.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-white/70">{service.description}</p>
                <Button variant="accent" size="sm" className="mt-6 self-start" onClick={openContact}>
                  Pedir orçamento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
