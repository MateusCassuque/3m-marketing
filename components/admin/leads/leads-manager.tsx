"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MessageCircle, Phone, Trash2, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SERVICE_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/lead-labels";
import { formatDate } from "@/lib/utils";
import {
  convertLeadToClient,
  deleteLead,
  saveLeadNotes,
  updateLeadStatus,
} from "@/app/admin/(protected)/leads/actions";
import type { LeadStatus, ServiceInterest } from "@prisma/client";

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: ServiceInterest;
  message: string;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 9 ? `244${digits}` : digits;
  return `https://wa.me/${full}`;
}

export function LeadsManager({ leads, canEdit }: { leads: LeadRow[]; canEdit: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const run = async (task: () => Promise<unknown>, success?: string, after?: () => void) => {
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      await task();
      if (success) setMessage(success);
      router.refresh();
      after?.();
    } catch (err) {
      console.error(err);
      setError("Não foi possível concluir a acção. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  const open = (lead: LeadRow) => {
    setSelectedId(lead.id);
    setNotes(lead.notes ?? "");
    setMessage(null);
    setError(null);
  };

  if (leads.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 text-center text-sm text-muted-foreground">
        Nenhum lead encontrado com estes filtros.
      </div>
    );
  }

  return (
    <>
      {/* Telemóvel: cartões */}
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-soft md:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => open(lead)} className="min-w-0 text-left">
                <span className="block truncate font-display text-base font-bold text-navy-700">{lead.name}</span>
                <span className="block truncate text-sm text-muted-foreground">{lead.email}</span>
              </button>
              <Badge variant={STATUS_BADGE_VARIANT[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
            </div>
            <p className="mt-2 text-sm text-navy-600">
              {SERVICE_LABELS[lead.service]}
              <span className="text-muted-foreground"> · {formatDate(lead.createdAt)}</span>
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{lead.message}</p>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => open(lead)}>
              Abrir lead
            </Button>
          </li>
        ))}
      </ul>

      {/* Ecrãs médios e grandes: tabela */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-white shadow-soft md:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-xs font-semibold text-muted-foreground">
              <th className="px-5 py-3">Contacto</th>
              <th className="px-5 py-3">Serviço</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Recebido</th>
              <th className="px-5 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-primary-50/40">
                <td className="px-5 py-3.5">
                  <button type="button" onClick={() => open(lead)} className="text-left">
                    <span className="block font-semibold text-navy-700 hover:text-primary-700">{lead.name}</span>
                    <span className="block text-xs text-muted-foreground">{lead.email}</span>
                  </button>
                </td>
                <td className="px-5 py-3.5 text-navy-600">{SERVICE_LABELS[lead.service]}</td>
                <td className="px-5 py-3.5">
                  {canEdit ? (
                    <Select
                      aria-label={`Estado de ${lead.name}`}
                      value={lead.status}
                      disabled={pending}
                      className="h-9 min-w-[140px] text-xs font-semibold"
                      onChange={(e) => run(() => updateLeadStatus(lead.id, e.target.value))}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Badge variant={STATUS_BADGE_VARIANT[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
                  )}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => open(lead)}>
                    Abrir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {SERVICE_LABELS[selected.service]} · recebido a {formatDate(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${selected.email}`}>
                    <Mail className="h-4 w-4" /> {selected.email}
                  </a>
                </Button>
                {selected.phone && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${selected.phone}`}>
                        <Phone className="h-4 w-4" /> {selected.phone}
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={whatsappLink(selected.phone)} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                  </>
                )}
              </div>

              <div className="rounded-xl bg-muted/70 p-4 text-sm leading-relaxed text-navy-700 whitespace-pre-wrap">
                {selected.message}
              </div>

              {canEdit && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="lead-notes" className="text-sm font-semibold text-navy-700">
                      Notas internas
                    </label>
                    <Textarea
                      id="lead-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex.: ligar na quinta, pediu orçamento de landing page…"
                      maxLength={2000}
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={pending}
                      onClick={() => run(() => saveLeadNotes(selected.id, notes), "Notas guardadas.")}
                    >
                      Guardar notas
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <Button
                      variant="teal"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        run(async () => {
                          const result = await convertLeadToClient(selected.id);
                          setMessage(result.created ? "Cliente criado e lead marcado como ganho." : "Já existia um cliente com este e-mail — lead marcado como ganho.");
                        })
                      }
                    >
                      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      Converter em cliente
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm("Eliminar este lead de forma permanente?")) {
                          run(() => deleteLead(selected.id), undefined, () => setSelectedId(null));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </Button>
                  </div>
                </>
              )}

              {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
