"use client";

import { useMemo, useState, useTransition } from "react";
import type { Client } from "@prisma/client";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ProjectFormDialog,
  type ProjectFormData,
} from "@/components/admin/pedidos/project-form-dialog";
import { deleteProject } from "@/app/admin/(protected)/pedidos/actions";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_BADGE, PRIORITY_LABELS, PRIORITY_BADGE } from "@/lib/project-labels";
import { SERVICE_LABELS } from "@/lib/lead-labels";

export type ProjectRow = ProjectFormData & { client: { name: string } };

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProjectsTable({
  projects,
  clients,
}: {
  projects: ProjectRow[];
  clients: Client[];
}) {
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        project.client.name.toLowerCase().includes(term),
    );
  }, [projects, query]);

  const handleNew = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleEdit = (project: ProjectRow) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (project: ProjectRow) => {
    const confirmed = window.confirm(
      `Excluir o pedido "${project.title}"? Isso também remove as faturas vinculadas.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteProject(project.id);
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título ou cliente…"
            className="pl-9"
          />
        </div>
        <Button variant="teal" onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo pedido
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          {projects.length === 0
            ? "Nenhum pedido cadastrado ainda."
            : "Nenhum pedido encontrado para essa busca."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Pedido</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Serviço</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Prioridade</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 font-medium text-navy-700">{project.title}</td>
                  <td className="px-5 py-3.5 text-navy-600">{project.client.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {SERVICE_LABELS[project.service]}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={PROJECT_STATUS_BADGE[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={PRIORITY_BADGE[project.priority]}>
                      {PRIORITY_LABELS[project.priority]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-navy-700">
                    {currencyFormatter.format(project.value)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
                        aria-label={`Editar ${project.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        disabled={isPending}
                        className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Excluir ${project.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        clients={clients}
      />
    </div>
  );
}
