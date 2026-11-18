-- Acerto único: pedidos ainda em "Backlog" que já têm pelo menos uma factura paga
-- passam a "Em andamento" (a regra automática passa a fazer isto a partir de agora).
UPDATE "Project" AS p
SET "status" = 'EM_ANDAMENTO'
WHERE p."status" = 'BACKLOG'
  AND EXISTS (
    SELECT 1 FROM "Invoice" i
    WHERE i."projectId" = p."id" AND i."status" = 'PAGA'
  );
