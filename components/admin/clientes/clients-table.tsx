"use client";

import { useMemo, useState, useTransition } from "react";
import type { Client } from "@prisma/client";
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientFormDialog } from "@/components/admin/clientes/client-form-dialog";
import { deleteClient } from "@/app/admin/(protected)/clientes/actions";

type ClientWithCount = Client & { _count: { projects: number } };

export function ClientsTable({ clients }: { clients: ClientWithCount[] }) {
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term),
    );
  }, [clients, query]);

  const handleNew = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleDelete = (client: Client) => {
    const confirmed = window.confirm(
      `Excluir "${client.name}"? Isso também remove os pedidos e faturas vinculados.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteClient(client.id);
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
            placeholder="Buscar por nome, e-mail ou empresa…"
            className="pl-9"
          />
        </div>
        <Button variant="teal" onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          {clients.length === 0
            ? "Nenhum cliente cadastrado ainda."
            : "Nenhum cliente encontrado para essa busca."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">Contato</th>
                <th className="px-5 py-3">Pedidos</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0">
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
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(client)}
                        className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
                        aria-label={`Editar ${client.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(client)}
                        disabled={isPending}
                        className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Excluir ${client.name}`}
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

      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editingClient} />
    </div>
  );
}
