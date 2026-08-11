"use client"

import { useMemo, useState, useTransition } from "react"
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  InvoiceFormDialog,
  type InvoiceFormData,
  type ProjectOption,
} from "@/components/admin/faturas/invoice-form-dialog"
import { deleteInvoice } from "@/app/admin/(protected)/faturas/actions"
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_BADGE } from "@/lib/invoice-labels"
import { formatCurrency } from "@/lib/utils"
import { InvoiceViewDialog } from "./invoice-view-dialog"

export type InvoiceRow = InvoiceFormData & {
  project: {
    title: string, client: {
      name: string,
      adress: string
      company: string
      telefone: string
    }
  }
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" })

function isOverdue(invoice: InvoiceRow) {
  return invoice.status === "PENDENTE" && new Date(invoice.dueDate) < new Date()
}

export function InvoicesTable({
  invoices,
  projects,
}: {
  invoices: InvoiceRow[]
  projects: ProjectOption[]
}) {
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return invoices
    return invoices.filter(
      (invoice) =>
        invoice.number.toLowerCase().includes(term) ||
        invoice.project.title.toLowerCase().includes(term) ||
        invoice.project.client.name.toLowerCase().includes(term),
    )
  }, [invoices, query])

  const handleNew = () => {
    setEditingInvoice(null)
    setDialogOpen(true)
  }

  const handleEdit = (invoice: InvoiceRow) => {
    setEditingInvoice(invoice)
    setDialogOpen(true)
  }

  const handleView = (invoice: InvoiceRow) => {
    setViewingInvoice(invoice)
    setViewDialogOpen(true)
  }

  const handleDelete = (invoice: InvoiceRow) => {
    const confirmed = window.confirm(`Excluir a fatura ${invoice.number}?`)
    if (!confirmed) return

    startTransition(async () => {
      await deleteInvoice(invoice.id)
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por número, pedido ou cliente…"
            className="pl-9"
          />
        </div>
        <Button variant="teal" onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nova fatura
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          {invoices.length === 0
            ? "Nenhuma fatura cadastrada ainda."
            : "Nenhuma fatura encontrada para essa busca."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Fatura</th>
                <th className="px-5 py-3">Pedido / Cliente</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Vencimento</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 font-medium text-navy-700">{invoice.number}</td>
                  <td className="px-5 py-3.5 text-navy-600">
                    <div>{invoice.project.title}</div>
                    <div className="text-xs text-muted-foreground">{invoice.project.client.name}</div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-navy-700">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={isOverdue(invoice) ? "destructive" : INVOICE_STATUS_BADGE[invoice.status]}>
                      {isOverdue(invoice) ? "Vencida" : INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {dateFormatter.format(new Date(invoice.dueDate))}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleView(invoice)}
                        className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-700"
                        aria-label={`Visualizar fatura ${invoice.number}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(invoice)}
                        className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
                        aria-label={`Editar fatura ${invoice.number}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(invoice)}
                        disabled={isPending}
                        className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Excluir fatura ${invoice.number}`}
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

      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={editingInvoice}
        projects={projects}
      />

      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={viewingInvoice}
      />
    </div>
  )
}