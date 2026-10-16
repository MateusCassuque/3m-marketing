"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ProjectCard } from "@/components/project-card";
import { PROJECTS, PROJECT_CATEGORIES } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function PortfolioGrid() {
  const [active, setActive] = useState<(typeof PROJECT_CATEGORIES)[number]>("Todos");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("Todos", PROJECTS.length);
    PROJECTS.forEach((p) => map.set(p.category, (map.get(p.category) ?? 0) + 1));
    return map;
  }, []);

  const filtered = useMemo(
    () => (active === "Todos" ? PROJECTS : PROJECTS.filter((p) => p.category === active)),
    [active],
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filtrar projectos por categoria"
        className="flex flex-wrap justify-center gap-2.5"
      >
        {PROJECT_CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0).map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active === category}
            onClick={() => setActive(category)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active === category
                ? "border-navy-700 bg-navy-700 text-white"
                : "border-border bg-white text-navy-500 hover:border-primary-300 hover:text-primary-700",
            )}
          >
            {category}
            <span className={cn("ml-2 text-xs", active === category ? "text-white/60" : "text-navy-300")}>
              {counts.get(category)}
            </span>
          </button>
        ))}
      </div>

      <motion.div layout className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
