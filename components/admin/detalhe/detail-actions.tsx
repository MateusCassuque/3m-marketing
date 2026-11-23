"use client";

import { useState } from "react";
import type { Client } from "@prisma/client";
import { Pencil, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientFormDialog } from "@/components/admin/clientes/client-form-dialog";
import {
  InvoiceFormDialog,
  type ProjectOption,
} from "@/components/admin/faturas/invoice-form-dialog";
import type { AccountOption } from "@/lib/accounts";
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

/** Emite uma factura deste pedido sem sair da página: o pedido já vem seleccionado. */
export function NewInvoiceButton({
  project,
  clients,
  accounts,
}: {
  project: ProjectOption;
  clients: Client[];
  accounts: AccountOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="teal" size="sm" onClick={() => setOpen(true)}>
        <Receipt className="h-4 w-4" />
        Nova factura
      </Button>
      <InvoiceFormDialog
        open={open}
        onOpenChange={setOpen}
        projects={[project]}
        clients={clients}
        accounts={accounts}
        defaultProjectId={project.id}
      />
    </>
  );
}
