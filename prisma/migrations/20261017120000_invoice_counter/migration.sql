-- Contador sequencial para os números das facturas (FAT-0001, FAT-0002, ...).
-- Substitui o cálculo "total de facturas + 1", que falhava depois de eliminar uma factura.
CREATE TABLE "InvoiceCounter" (
    "id" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceCounter_pkey" PRIMARY KEY ("id")
);

-- Começa no maior número já emitido, para a próxima factura ser a seguinte.
INSERT INTO "InvoiceCounter" ("id", "lastNumber")
SELECT 1, COALESCE(MAX(CAST(substring("number" from '^FAT-([0-9]+)$') AS INTEGER)), 0)
FROM "Invoice";
