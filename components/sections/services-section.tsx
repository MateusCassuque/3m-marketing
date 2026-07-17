"use client";

import { motion } from "framer-motion";
import {
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SERVICES: Service[] = [
  {
    icon: Target,
    title: "Estratégia",
    description:
      "Planejamento estratégico personalizado para atingir seus objetivos.",
  },
  {
    icon: Lightbulb,
    title: "Criatividade",
    description:
      "Campanhas criativas que conectam sua marca ao seu público.",
  },
  {
    icon: TrendingUp,
    title: "Gestão de Tráfego",
    description:
      "Anúncios inteligentes que geram mais alcance, leads e vendas.",
  },
  {
    icon: Users,
    title: "Mídias Sociais",
    description:
      "Gestão completa das suas redes sociais com conteúdo estratégico.",
  },
  {
    icon: Megaphone,
    title: "Branding",
    description:
      "Construímos marcas fortes, com identidade e propósito claros.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function ServicesSection() {
  return (
    <section id="servicos" className="bg-white py-20 lg:py-24">
      <div className="container-padded">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mx-auto justify-center">Como podemos ajudar</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">
            Soluções completas para o crescimento da sua marca
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-14 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6 lg:divide-x lg:divide-border"
        >
          {SERVICES.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              className="group flex flex-col items-center px-4 text-center"
            >
              <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-white">
                <Icon className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-navy-700">
                {title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
