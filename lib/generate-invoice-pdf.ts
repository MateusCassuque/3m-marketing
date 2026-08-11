import { Phone } from 'lucide-react';
import jsPDF from "jspdf"

import { INVOICE_LOGO_BASE64 } from "@/lib/invoice-logo"

import type { InvoiceRow } from "@/components/admin/faturas/invoices-table"

// Dados fixos da empresa emissora
const COMPANY = {
    name: "3M Visa - Marketing",
    address: "CASA S/N, ZONA 16, SAMBIZANGA, LUANDA",
    nif: "5002516888",
}

const IVA_RATE = 0 // sem cobrança de IVA no momento — ajusta se necessário

function formatAOA(value: number) {
    const parts = value.toFixed(2).split(".")
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return `${intPart},${parts[1]} AOA`
}

function formatDateTime(date: Date) {
    const dd = String(date.getDate()).padStart(2, "0")
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const yyyy = date.getFullYear()
    const hh = String(date.getHours()).padStart(2, "0")
    const min = String(date.getMinutes()).padStart(2, "0")
    return `${dd}/${mm}/${yyyy}, ${hh}:${min}`
}

export function generateInvoicePdf(invoice: InvoiceRow) {
    const doc = new jsPDF({ unit: "mm", format: "a4" })

    const marginX = 20
    const rightX = 190

    // --- Logotipo ---
    const logoWidth = 32
    const logoHeight = logoWidth * (312 / 500)
    doc.addImage(INVOICE_LOGO_BASE64, "JPEG", marginX, 15, logoWidth, logoHeight)

    // --- Título e metadados ---
    doc.setTextColor(20, 20, 20)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("FACTURA", rightX, 24, { align: "right" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(90, 90, 90)
    doc.text(`Nº: ${invoice.number}`, rightX, 31, { align: "right" })
    doc.text(
        `Data: ${formatDateTime(new Date(invoice.issueDate ?? invoice.dueDate))}`,
        rightX,
        36,
        { align: "right" },
    )

    // --- Dados da empresa (esquerda) ---
    const y = 48
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    doc.text(COMPANY.name, marginX, y)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(90, 90, 90)
    doc.text(COMPANY.address, marginX, y + 5)
    doc.text(`NIF: ${COMPANY.nif}`, marginX, y + 10)

    // --- Dados do cliente (direita) ---
    const clientX = 130
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    doc.text("Faturar para:", clientX, y)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(60, 60, 60)
    doc.text(invoice.project.client.name, clientX, y + 5)
    if (invoice.project.client.company) {
        doc.text(invoice.project.client.company, clientX, y + 10)
    }

    if (invoice.project.client.adress) {
        doc.text(invoice.project.client.adress, clientX, y + 15)
    }

    if (invoice.project.client.telefone) {
        doc.text(invoice.project.client.telefone, clientX, y + 20)
    }

    // --- Tabela ---
    const tableY = y + 30
    const tableWidth = rightX - marginX

    doc.setFillColor(0, 100, 140)
    doc.rect(marginX, tableY, tableWidth, 8, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Produto", marginX + 3, tableY + 5.5)
    doc.text("Status", marginX + 50, tableY + 5.5)
    doc.text("Qtd", marginX + 92, tableY + 5.5)
    doc.text("Preço", marginX + 112, tableY + 5.5)
    doc.text("Total", rightX - 3, tableY + 5.5, { align: "right" })

    const rowY = tableY + 8
    const rowHeight = 9
    doc.setFillColor(245, 245, 245)
    doc.rect(marginX, rowY, tableWidth, rowHeight, "F")

    doc.setTextColor(30, 30, 30)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.text(invoice.project.title, marginX + 3, rowY + 6)
    doc.text(invoice.status, marginX + 50, rowY + 6)
    doc.text("1", marginX + 92, rowY + 6)
    doc.text(formatAOA(invoice.amount), marginX + 112, rowY + 6)
    doc.text(formatAOA(invoice.amount), rightX - 3, rowY + 6, { align: "right" })

    // --- Totais ---
    const subtotal = invoice.amount
    const iva = subtotal * IVA_RATE
    const total = subtotal + iva

    const totalsY = rowY + rowHeight + 14
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(60, 60, 60)
    doc.text(`Subtotal: ${formatAOA(subtotal)}`, rightX, totalsY, { align: "right" })
    doc.text(`IVA (${(IVA_RATE * 100).toFixed(0)}%): ${formatAOA(iva)}`, rightX, totalsY + 5.5, {
        align: "right",
    })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(20, 20, 20)
    doc.text(`Total: ${formatAOA(total)}`, rightX, totalsY + 14, { align: "right" })

    doc.setFontSize(9)
    doc.text(invoice.paymentMethod || '', marginX, 269)

    // --- Rodapé ---
    doc.setDrawColor(210, 210, 210)
    doc.line(marginX, 275, marginX + 70, 275)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(140, 140, 140)
    doc.text("Gerado automaticamente pelo sistema", marginX, 281)
    doc.text(invoice.notes || '', marginX, 287)

    doc.save(`fatura-${invoice.number}.pdf`)
}