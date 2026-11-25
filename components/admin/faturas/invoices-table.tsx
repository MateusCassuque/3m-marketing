"use client"

import { useState } from "react"
import Link from "next/link"
import { BadgeCheck, CalendarClock, Eye, Pencil, Plus, Trash2 } from "lucide-react"
import type { Client } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  InvoiceFormDialog,
  type InvoiceFormData,
  type ProjectOption,
} from "@/components/admin/faturas/invoice-form-dialog"
import { Pagination } from "@/components/admin/pagination"
import { SearchForm } from "@/components/admin/list-toolbar"
import {
  CardActions,
  RowActions,
  STICKY_TD,
  STICKY_TH,
  type RowAction,
} from "@/components/admin/row-actions"
import type { ServiceDetails } from "@/lib/service-details"
import { PaymentAccountDialog } from "@/components/admin/faturas/payment-account-dialog"
import type { AccountOption } from "@/lib/accounts"
import { deleteInvoice, markInvoicePaid } from "@/app/admin/(protected)/faturas/actions"
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_BADGE } from "@/lib/invoice-labels"
import { formatCurrency, formatDateNotTime } from "@/lib/utils"
import { InvoiceViewDialog } from "./invoice-view-dialog"

export type InvoiceRow = InvoiceFormData & {
  /** Controlo de parcelas (null em facturas antigas ainda sem cálculo). */
  installment: number | null
  /** Nº da cobrança, se a factura foi gerada por um projecto recorrente. */
  recurringCycle: number | null
  projectTotal: number | null
  previouslyInvoiced: number | null
  remaining: number | null
  project: {
    title: string,
    /** Serviço do pedido e detalhes (requerentes de visto/passaporte, passageiros). */
    service: string,
    details: ServiceDetails | null,
    client: {
      name: string,
      adress: string
      company: string
      telefone: string
    }
  }
}

/** "Em falta" de uma factura: valor ainda por facturar do pedido, ou "nada em falta". */
export function RemainingInfo({ invoice, compact = false }: { invoice: InvoiceRow; compact?: boolean }) {
  if (invoice.recurringCycle !== null && invoice.status !== "CANCELADA") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
        Recorrente <span className="font-medium text-muted-foreground">· n.º {invoice.recurringCycle}</span>
      </span>
    )
  }

  if (invoice.status === "CANCELADA" || invoice.remaining === null) {
    return <span className="text-muted-foreground">—</span>
  }

  const parcel =
    invoice.installment !== null && (invoice.installment > 1 || invoice.remaining > 0)
      ? `${invoice.installment}.ª parcela`
      : null

  return (
    <div className={compact ? "flex flex-wrap items-center gap-x-2 gap-y-0.5" : undefined}>
      {invoice.remaining > 0 ? (
        <span className="font-semibold text-accent-700">Em falta {formatCurrency(invoice.remaining)}</span>
      ) : (
        <span className="font-semibold text-emerald-600">Nada em falta</span>
      )}
      {parcel && <span className="block text-xs text-muted-foreground">{parcel}{invoice.projectTotal !== null ? ` de ${formatCurrency(invoice.projectTotal)}` : ""}</span>}
    </div>
  )
}

function isOverdue(invoice: InvoiceRow) {
  return invoice.status === "VENCIDA" || (invoice.status === "PENDENTE" && new Date(invoice.dueDate) < new Date())
}

interface InvoicesTableProps {
  invoices: InvoiceRow[]
  projects: ProjectOption[]
  clients: Client[]
  accounts: AccountOption[]
  q: string
  estado: string
  /** Período em uso (?periodo=&de=&ate=) — mantém-se ao pesquisar e paginar. */
  range: { periodo?: string; de?: string; ate?: string }
  page: number
  totalPages: number
  total: number
}

export function InvoicesTable({ invoices, projects, clients, accounts, q, estado, range, page, totalPages, total }: InvoicesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [payingInvoice, setPayingInvoice] = useState<InvoiceRow | null>(null)

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

  const handleDelete = async (invoice: InvoiceRow) => {
    const confirmed = window.confirm(`Eliminar a factura ${invoice.number}?`)
    if (!confirmed) return

    setBusy(true)
    try {
      await deleteInvoice(invoice.id)
    } catch (error) {
      console.error(error)
      window.alert("Não foi possível eliminar a factura.")
    } finally {
      setBusy(false)
    }
  }

  const actionsFor = (invoice: InvoiceRow): RowAction[] => [
    ...(invoice.status === "PENDENTE" || invoice.status === "VENCIDA"
      ? [{ label: "Marcar paga", icon: BadgeCheck, tone: "primary" as const, onClick: () => setPayingInvoice(invoice) }]
      : []),
    { label: "Ver", icon: Eye, onClick: () => handleView(invoice) },
    { label: "Editar", icon: Pencil, tone: "primary", onClick: () => handleEdit(invoice) },
    { label: "Eliminar", icon: Trash2, tone: "danger", disabled: busy, onClick: () => handleDelete(invoice) },
  ]

  const statusBadge = (invoice: InvoiceRow) => (
    <Badge variant={isOverdue(invoice) ? "destructive" : INVOICE_STATUS_BADGE[invoice.status]}>
      {isOverdue(invoice) ? "Vencida" : INVOICE_STATUS_LABELS[invoice.status]}
    </Badge>
  )

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchForm q={q} basePath="/admin/faturas" hidden={{ estado, ...range }} placeholder="Pesquisar por número, pedido ou cliente…" />
        <Button variant="teal" onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nova factura
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex h-40 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {q || estado ? "Nenhuma factura encontrada com estes filtros." : "Ainda não há facturas registadas."}
        </div>
      ) : (
        <>
          {/* Telemóvel: cartões */}
          <ul className="divide-y divide-border md:hidden">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-navy-700">{invoice.number}</p>
                    <Link href={`/admin/pedidos/${invoice.projectId}`} className="mt-0.5 block truncate text-sm text-primary-700 hover:underline">
                      {invoice.project.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{invoice.project.client.name}</p>
                  </div>
                  <p className="shrink-0 font-display text-base font-bold text-navy-700">
                    {formatCurrency(invoice.amount)}
                  </p>
                </div>
                <div className="mt-3 text-sm">
                  <RemainingInfo invoice={invoice} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {statusBadge(invoice)}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Vence {formatDateNotTime(invoice.dueDate)}
                  </span>
                </div>
                <CardActions actions={actionsFor(invoice)} subject={`factura ${invoice.number}`} />
              </li>
            ))}
          </ul>

          {/* Ecrãs médios e grandes: tabela com a coluna de ações fixa */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                  <th className="px-5 py-3">Factura</th>
                  <th className="px-5 py-3">Pedido / Cliente</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Em falta</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Vencimento</th>
                  <th className={STICKY_TH}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="group border-b border-border last:border-0 hover:bg-primary-50/40">
                    <td className="px-5 py-3.5 font-medium text-navy-700">{invoice.number}</td>
                    <td className="px-5 py-3.5 text-navy-600">
                      <Link href={`/admin/pedidos/${invoice.projectId}`} className="block hover:text-primary-700 hover:underline">
                        {invoice.project.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">{invoice.project.client.name}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-navy-700">{formatCurrency(invoice.amount)}</td>
                    <td className="px-5 py-3.5">
                      <RemainingInfo invoice={invoice} />
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(invoice)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDateNotTime(invoice.dueDate)}</td>
                    <td className={STICKY_TD}>
                      <RowActions actions={actionsFor(invoice)} subject={`factura ${invoice.number}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination basePath="/admin/faturas" page={page} totalPages={totalPages} total={total} params={{ q, estado, ...range }} />

      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={editingInvoice}
        projects={projects}
        clients={clients}
        accounts={accounts}
      />

      <PaymentAccountDialog
        open={Boolean(payingInvoice)}
        onOpenChange={(next) => !next && setPayingInvoice(null)}
        accounts={accounts}
        subject={payingInvoice ? `${payingInvoice.number} · ${formatCurrency(payingInvoice.amount)}` : undefined}
        onConfirm={async ({ accountId, paidAt }) => {
          if (payingInvoice) await markInvoicePaid(payingInvoice.id, { accountId, paidAt })
          setPayingInvoice(null)
        }}
      />

      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={viewingInvoice}
      />
    </div>
  )
}
