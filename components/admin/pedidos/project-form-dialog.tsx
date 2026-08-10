"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Client } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  projectSchema,
  type ProjectValues,
  PROJECT_STATUS_VALUES,
  PRIORITY_VALUES,
  SERVICE_VALUES,
} from "@/lib/validations/project";
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/project-labels";
import { SERVICE_LABELS } from "@/lib/lead-labels";
import { createProject, updateProject } from "@/app/admin/(protected)/pedidos/actions";

export interface ProjectFormData {
  id: string;
  title: string;
  description: string | null;
  clientId: string;
  service: ProjectValues["service"];
  status: ProjectValues["status"];
  priority: ProjectValues["priority"];
  value: number;
  startDate: Date | null;
  dueDate: Date | null;
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectFormData | null;
  clients: Client[];
}

const EMPTY_VALUES: ProjectValues = {
  title: "",
  description: "",
  clientId: "",
  service: "ESTRATEGIA",
  status: "BACKLOG",
  priority: "MEDIA",
  value: 0,
  startDate: "",
  dueDate: "",
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ProjectFormDialog({ open, onOpenChange, project, clients }: ProjectFormDialogProps) {
  const isEditing = Boolean(project);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        project
          ? {
              title: project.title,
              description: project.description ?? "",
              clientId: project.clientId,
              service: project.service,
              status: project.status,
              priority: project.priority,
              value: project.value,
              startDate: toDateInputValue(project.startDate),
              dueDate: toDateInputValue(project.dueDate),
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, project, reset]);

  const onSubmit = async (values: ProjectValues) => {
    if (isEditing && project) {
      await updateProject(project.id, values);
    } else {
      await createProject(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar pedido" : "Novo pedido"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do pedido/projeto."
              : "Cadastre um novo pedido vinculado a um cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex.: Campanha de lançamento — Q3" {...register("title")} />
            {errors.title && (
              <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="clientId">Cliente</Label>
              <Select id="clientId" {...register("clientId")}>
                <option value="">Selecione…</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
              {errors.clientId && (
                <p className="text-xs font-medium text-destructive">{errors.clientId.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service">Serviço</Label>
              <Select id="service" {...register("service")}>
                {SERVICE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {SERVICE_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                {PROJECT_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PROJECT_STATUS_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Prioridade</Label>
              <Select id="priority" {...register("priority")}>
                {PRIORITY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Valor (Kz)</Label>
              <Input id="value" type="number" step="0.01" min="0" {...register("value")} />
              {errors.value && (
                <p className="text-xs font-medium text-destructive">{errors.value.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Início</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Prazo</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <Button type="submit" variant="teal" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Cadastrar pedido"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
