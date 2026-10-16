"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/lib/site-data";

export function FeaturedWork() {
  const featured = PROJECTS.filter((p) => p.featured);

  return (
    <section className="relative overflow-hidden bg-secondary/70 py-20 lg:py-28">
      <div className="container-padded">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Trabalhos recentes</p>
            <h2 className="mt-4 max-w-xl text-balance font-display text-3xl font-bold text-navy-700 sm:text-5xl">
              Sites e sistemas que já estão no ar
            </h2>
          </div>
          <Button variant="primary" asChild>
            <Link href="/portfolio">
              Ver todos os projectos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: "easeOut" }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
