"use client";

import { useState } from "react";
import Link from "next/link";
import type { Client } from "@prisma/client";
import { CalendarClock, Pencil, Plus, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProjectFormDialog,
  type ProjectFormData,
} from "@/components/admin/pedidos/project-form-dialog";
import { Pagination } from "@/components/admin/pagination";
import { SearchForm } from "@/components/admin/list-toolbar";
import {
  CardActions,
  RowActions,
  STICKY_TD,
  STICKY_TH,
  type RowAction,
} from "@/components/admin/row-actions";
import { deleteProject } from "@/app/admin/(protected)/pedidos/actions";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_BADGE,
  PRIORITY_LABELS,
  PRIORITY_BADGE,
} from "@/lib/project-labels";
import { SERVICE_LABELS } from "@/lib/lead-labels";
import { formatCurrency, formatDateNotTime } from "@/lib/utils";

export type ProjectRow = ProjectFormData & { client: { name: string } };

interface ProjectsTableProps {
  projects: ProjectRow[];
  clients: Client[];
  q: string;
  estado: string;
  page: number;
  totalPages: number;
  total: number;
}

export function ProjectsTable({ projects, clients, q, estado, page, totalPages, total }: ProjectsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [busy, setBusy] = useState(false);

  const handleNew = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleEdit = (project: ProjectRow) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDelete = async (project: ProjectRow) => {
    const confirmed = window.confirm(
      `Eliminar o pedido "${project.title}"? Isto também remove as facturas associadas.`,
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await deleteProject(project.id);
    } catch (error) {
      console.error(error);
      window.alert("Não foi possível eliminar o pedido.");
    } finally {
      setBusy(false);
    }
  };

  const actionsFor = (project: ProjectRow): RowAction[] => [
    { label: "Editar", icon: Pencil, tone: "primary", onClick: () => handleEdit(project) },
    { label: "Eliminar", icon: Trash2, tone: "danger", disabled: busy, onClick: () => handleDelete(project) },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchForm q={q} basePath="/admin/pedidos" hidden={{ estado }} placeholder="Pesquisar por título ou cliente…" />
        <Button variant="teal" onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo pedido
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex h-40 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {q || estado ? "Nenhum pedido encontrado com estes filtros." : "Ainda não há pedidos registados."}
        </div>
      ) : (
        <>
          {/* Telemóvel: cartões */}
          <ul className="divide-y divide-border md:hidden">
            {projects.map((project) => (
              <li key={project.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/pedidos/${project.id}`} className="font-display text-base font-bold text-navy-700 hover:text-primary-700 hover:underline">
                    {project.title}
                  </Link>
                  <p className="shrink-0 font-display text-base font-bold text-navy-700">
                    {formatCurrency(project.value)}
                  </p>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-600">
                  <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {project.client.name}
                  <span className="text-muted-foreground">· {SERVICE_LABELS[project.service]}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={PROJECT_STATUS_BADGE[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
                  <Badge variant={PRIORITY_BADGE[project.priority]}>{PRIORITY_LABELS[project.priority]}</Badge>
                  {project.dueDate && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Entrega {formatDateNotTime(project.dueDate)}
                    </span>
                  )}
                </div>
                <CardActions actions={actionsFor(project)} subject={project.title} />
              </li>
            ))}
          </ul>

          {/* Ecrãs médios e grandes: tabela com a coluna de ações fixa */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Serviço</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Prioridade</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className={STICKY_TH}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="group border-b border-border last:border-0 hover:bg-primary-50/40">
                    <td className="px-5 py-3.5 font-medium">
                      <Link href={`/admin/pedidos/${project.id}`} className="text-navy-700 hover:text-primary-700 hover:underline">
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-navy-600">
                      <Link href={`/admin/clientes/${project.clientId}`} className="hover:text-primary-700 hover:underline">
                        {project.client.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{SERVICE_LABELS[project.service]}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={PROJECT_STATUS_BADGE[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={PRIORITY_BADGE[project.priority]}>{PRIORITY_LABELS[project.priority]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-navy-700">{formatCurrency(project.value)}</td>
                    <td className={STICKY_TD}>
                      <RowActions actions={actionsFor(project)} subject={project.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination basePath="/admin/pedidos" page={page} totalPages={totalPages} total={total} params={{ q, estado }} />

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        clients={clients}
      />
    </div>
  );
}
