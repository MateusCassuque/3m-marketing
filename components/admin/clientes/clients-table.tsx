"use client";

import { useState } from "react";
import type { Client } from "@prisma/client";
import { Building2, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientFormDialog } from "@/components/admin/clientes/client-form-dialog";
import { Pagination } from "@/components/admin/pagination";
import { SearchForm } from "@/components/admin/list-toolbar";
import {
  CardActions,
  RowActions,
  STICKY_TD,
  STICKY_TH,
  type RowAction,
} from "@/components/admin/row-actions";
import { deleteClient } from "@/app/admin/(protected)/clientes/actions";

type ClientWithCount = Client & { _count: { projects: number } };

interface ClientsTableProps {
  clients: ClientWithCount[];
  q: string;
  page: number;
  totalPages: number;
  total: number;
}

export function ClientsTable({ clients, q, page, totalPages, total }: ClientsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [busy, setBusy] = useState(false);

  const handleNew = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleDelete = async (client: Client) => {
    const confirmed = window.confirm(
      `Eliminar "${client.name}"? Isto também remove os pedidos e facturas associados.`,
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await deleteClient(client.id);
    } catch (error) {
      console.error(error);
      window.alert("Não foi possível eliminar o cliente.");
    } finally {
      setBusy(false);
    }
  };

  const actionsFor = (client: ClientWithCount): RowAction[] => [
    { label: "Editar", icon: Pencil, tone: "primary", onClick: () => handleEdit(client) },
    { label: "Eliminar", icon: Trash2, tone: "danger", disabled: busy, onClick: () => handleDelete(client) },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchForm q={q} basePath="/admin/clientes" placeholder="Pesquisar por nome, e-mail ou empresa…" />
        <Button variant="teal" onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="flex h-40 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {q ? "Nenhum cliente encontrado para esta pesquisa." : "Ainda não há clientes registados."}
        </div>
      ) : (
        <>
          {/* Telemóvel: cartões */}
          <ul className="divide-y divide-border md:hidden">
            {clients.map((client) => (
              <li key={client.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold text-navy-700">{client.name}</p>
                    {client.company && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-navy-600">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{client.company}</span>
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                    {client._count.projects} {client._count.projects === 1 ? "pedido" : "pedidos"}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <a href={`mailto:${client.email}`} className="truncate hover:text-primary-700">
                      {client.email}
                    </a>
                  </p>
                  {client.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a href={`tel:${client.phone}`} className="hover:text-primary-700">
                        {client.phone}
                      </a>
                    </p>
                  )}
                </div>
                <CardActions actions={actionsFor(client)} subject={client.name} />
              </li>
            ))}
          </ul>

          {/* Ecrãs médios e grandes: tabela com a coluna de ações fixa */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Pedidos</th>
                  <th className={STICKY_TH}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="group border-b border-border last:border-0 hover:bg-primary-50/40">
                    <td className="px-5 py-3.5 font-medium text-navy-700">{client.name}</td>
                    <td className="px-5 py-3.5 text-navy-600">
                      {client.company ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {client.company}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <div>{client.email}</div>
                      {client.phone && <div className="text-xs">{client.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-navy-600">{client._count.projects}</td>
                    <td className={STICKY_TD}>
                      <RowActions actions={actionsFor(client)} subject={client.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination basePath="/admin/clientes" page={page} totalPages={totalPages} total={total} params={{ q }} />

      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editingClient} />
    </div>
  );
}
