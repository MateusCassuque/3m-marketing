import type { Lead } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { SERVICE_LABELS, STATUS_BADGE_VARIANT, STATUS_LABELS } from "@/lib/lead-labels";

export function LeadsTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        Nenhum lead recebido ainda. Assim que alguém enviar o formulário de
        contato, ele aparece aqui.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3">Nome</th>
            <th className="px-5 py-3">E-mail</th>
            <th className="px-5 py-3">Serviço</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Recebido em</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3.5 font-medium text-navy-700">{lead.name}</td>
              <td className="px-5 py-3.5 text-muted-foreground">{lead.email}</td>
              <td className="px-5 py-3.5 text-navy-600">{SERVICE_LABELS[lead.service]}</td>
              <td className="px-5 py-3.5">
                <Badge variant={STATUS_BADGE_VARIANT[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
              </td>
              <td className="px-5 py-3.5 text-muted-foreground">
                {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
