"use client";

import { motion } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";

interface ServiceDetailProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  reverse?: boolean;
}

export function ServiceDetail({
  id,
  icon: Icon,
  title,
  description,
  bullets,
  reverse = false,
}: ServiceDetailProps) {
  return (
    <div
      id={id}
      className="container-padded grid scroll-mt-24 grid-cols-1 items-center gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-16"
    >
      <motion.div
        initial={{ opacity: 0, x: reverse ? 24 : -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={reverse ? "lg:order-2" : undefined}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-soft">
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h3 className="mt-6 font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 text-balance leading-relaxed text-muted-foreground">{description}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm text-navy-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={reverse ? "lg:order-1" : undefined}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-brand-gradient">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.2),transparent_55%)]" />
          <Icon
            className="absolute -bottom-8 -right-8 h-48 w-48 text-white/10"
            strokeWidth={1}
          />
          <span className="absolute left-8 top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </span>
        </div>
      </motion.div>
    </div>
  );
}
