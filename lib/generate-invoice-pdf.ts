import jsPDF from "jspdf";

import { INVOICE_STATUS_LABELS } from "@/lib/invoice-labels";
import { formatCurrency } from "@/lib/utils";

import type { InvoiceRow } from "@/components/admin/faturas/invoices-table";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});

export function generateInvoicePdf(invoice: InvoiceRow) {
    const doc = new jsPDF();
    const marginX = 20;
    let y = 25;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Fatura ${invoice.number}`, marginX, y);
    y += 14;

    doc.setFontSize(11);

    const rows: Array<[string, string]> = [
        ["Cliente", invoice.project.client.name],
        ["Pedido", invoice.project.title],
        ["Valor", formatCurrency(invoice.amount)],
        ["Status", INVOICE_STATUS_LABELS[invoice.status]],
        ...(invoice.issueDate ? [["Emissão", dateFormatter.format(new Date(invoice.issueDate))] as [string, string]] : []),
        ["Vencimento", dateFormatter.format(new Date(invoice.dueDate))],
        ...(invoice.paymentMethod ? [["Pagamento", invoice.paymentMethod] as [string, string]] : []),
    ];

    rows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, marginX, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, marginX + 45, y);
        y += 9;
    });

    if (invoice.notes) {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.text("Observações:", marginX, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(invoice.notes, 170), marginX, y);
    }

    doc.save(`fatura-${invoice.number}.pdf`);
}