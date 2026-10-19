"use client";

import { useState } from "react";
import type { Client } from "@prisma/client";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientFormDialog } from "@/components/admin/clientes/client-form-dialog";
import {
  ProjectFormDialog,
  type ProjectFormData,
} from "@/components/admin/pedidos/project-form-dialog";

export function EditClientButton({ client }: { client: Client }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Editar cliente
      </Button>
      <ClientFormDialog open={open} onOpenChange={setOpen} client={client} />
    </>
  );
}

export function EditProjectButton({ project, clients }: { project: ProjectFormData; clients: Client[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Editar pedido
      </Button>
      <ProjectFormDialog open={open} onOpenChange={setOpen} project={project} clients={clients} />
    </>
  );
}
