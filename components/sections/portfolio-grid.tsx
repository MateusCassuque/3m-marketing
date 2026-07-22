"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Megaphone,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Category = "Estratégia" | "Criatividade" | "Gestão de Tráfego" | "Mídias Sociais" | "Branding";

interface Project {
  client: string;
  title: string;
  category: Category;
  result: string;
}

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  "Estratégia": Target,
  "Criatividade": Lightbulb,
  "Gestão de Tráfego": TrendingUp,
  "Mídias Sociais": Users,
  "Branding": Megaphone,
};

const PROJECTS: Project[] = [
  { client: "Tudo Aqui", title: "Reposicionamento de marca", category: "Branding", result: "+64% reconhecimento de marca" },
  { client: "Freela Ao", title: "Campanha de lançamento", category: "Criatividade", result: "+40% de leads no 1º mês" },
  { client: "JM Jardins", title: "Estratégia de expansão nacional", category: "Estratégia", result: "3 novas Provincias em 6 meses" },
  { client: "JM Jardins", title: "Tráfego pago para captação", category: "Gestão de Tráfego", result: "-38% custo por matrícula" },
  { client: "Destinos Mágicos", title: "Gestão de redes sociais", category: "Mídias Sociais", result: "+210% engajamento" },
  { client: "Cozinha Delicious", title: "Identidade visual e naming", category: "Branding", result: "Marca relançada em 60 dias" },
  { client: "DS Alumínios", title: "Funil de vendas para pacotes", category: "Gestão de Tráfego", result: "ROAS de 6,2x" },
  { client: "MBD Group", title: "Planejamento de posicionamento", category: "Estratégia", result: "+180% tráfego orgânico" },
];

const CATEGORIES: Array<Category | "Todos"> = [
  "Todos",
  "Estratégia",
  "Criatividade",
  "Gestão de Tráfego",
  "Mídias Sociais",
  "Branding",
];

export function PortfolioGrid() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("Todos");

  const filtered = useMemo(
    () => (active === "Todos" ? PROJECTS : PROJECTS.filter((p) => p.category === active)),
    [active],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors",
              active === category
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-border bg-white text-navy-500 hover:border-primary-300 hover:text-primary-600",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => {
            const Icon = CATEGORY_ICON[project.category];
            return (
              <motion.article
                key={project.client}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-soft"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-gradient">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
                  <Icon
                    className="absolute -bottom-6 -right-6 h-32 w-32 text-white/10 transition-transform duration-500 group-hover:scale-110"
                    strokeWidth={1}
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary-600">
                    {project.client}
                  </p>
                  <h3 className="mt-1.5 flex items-center gap-1.5 font-display text-lg font-bold text-navy-700">
                    {project.title}
                    <ArrowUpRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">{project.result}</p>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
