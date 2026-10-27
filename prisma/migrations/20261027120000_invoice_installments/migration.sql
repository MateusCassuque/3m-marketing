-- Controlo de parcelas por pedido: total, já facturado, valor em falta.
ALTER TABLE "Invoice"
  ADD COLUMN "installment" INTEGER,
  ADD COLUMN "projectTotal" DECIMAL(10,2),
  ADD COLUMN "previouslyInvoiced" DECIMAL(10,2),
  ADD COLUMN "remaining" DECIMAL(10,2),
  ADD COLUMN "settlesProject" BOOLEAN NOT NULL DEFAULT false;

-- Preenche as facturas que já existem, pela ordem em que foram criadas
-- (as canceladas não contam como facturado).
UPDATE "Invoice" AS i SET
  "projectTotal" = p."value",
  "previouslyInvoiced" = COALESCE((
    SELECT SUM(x."amount") FROM "Invoice" x
    WHERE x."projectId" = i."projectId" AND x."status" <> 'CANCELADA'
      AND (x."createdAt" < i."createdAt" OR (x."createdAt" = i."createdAt" AND x."id" < i."id"))
  ), 0),
  "installment" = 1 + (
    SELECT COUNT(*) FROM "Invoice" x
    WHERE x."projectId" = i."projectId" AND x."status" <> 'CANCELADA'
      AND (x."createdAt" < i."createdAt" OR (x."createdAt" = i."createdAt" AND x."id" < i."id"))
  )
FROM "Project" p
WHERE p."id" = i."projectId";

UPDATE "Invoice"
SET "remaining" = GREATEST("projectTotal" - "previouslyInvoiced" - "amount", 0);
