"use client";

import { ArrowUpRight } from "lucide-react";

import { ProjectMockup } from "@/components/project-mockup";
import { TiltCard } from "@/components/tilt-card";
import type { Project } from "@/lib/site-data";

export function ProjectCard({ project }: { project: Project }) {
  const host = project.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <article className="group">
      <TiltCard className="rounded-2xl">
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visitar ${project.name} (abre num novo separador)`}
          className="block rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-navy-900/5 transition-shadow duration-300 group-hover:shadow-glow"
          style={{ transform: "translateZ(0)" }}
        >
          <div style={{ transform: "translateZ(24px)" }}>
            <ProjectMockup project={project} />
          </div>
        </a>
      </TiltCard>

      <div className="mt-5 flex items-start justify-between gap-4 px-1">
        <div>
          <p className="text-xs font-semibold text-primary-600">{project.sector}</p>
          <h3 className="mt-1 font-display text-xl font-bold text-navy-700">{project.name}</h3>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy-600 transition-colors hover:border-primary-400 hover:text-primary-700"
        >
          {host.length > 22 ? "Visitar" : host}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <p className="mt-2 px-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
    </article>
  );
}
