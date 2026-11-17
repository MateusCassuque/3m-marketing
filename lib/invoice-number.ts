import type { Prisma } from "@prisma/client"

type Tx = Prisma.TransactionClient

/**
 * Próximo número de factura (FAT-0001, FAT-0002, …).
 *
 * Usa um contador que só avança: eliminar uma factura nunca "devolve" o número,
 * por isso não há colisões nem números repetidos. O incremento é atómico (uma
 * única instrução na base de dados), logo dois pedidos em simultâneo recebem
 * números diferentes. Se, por qualquer razão, o número já existir (p. ex. uma
 * factura criada à mão), salta para o seguinte livre.
 */
export async function nextInvoiceNumber(tx: Tx): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const counter = await tx.invoiceCounter.upsert({
      where: { id: 1 },
      update: { lastNumber: { increment: 1 } },
      create: { id: 1, lastNumber: 1 },
    })

    const number = `FAT-${String(counter.lastNumber).padStart(4, "0")}`
    const taken = await tx.invoice.findUnique({ where: { number }, select: { id: true } })
    if (!taken) return number
  }

  throw new Error("Não foi possível gerar um número de factura livre.")
}

