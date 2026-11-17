-- Novos serviços: assessoria de visto, bilhetes de passagem, assessoria de passaporte.
ALTER TYPE "ServiceInterest" ADD VALUE IF NOT EXISTS 'ASSESSORIA_VISTO';
ALTER TYPE "ServiceInterest" ADD VALUE IF NOT EXISTS 'BILHETES';
ALTER TYPE "ServiceInterest" ADD VALUE IF NOT EXISTS 'ASSESSORIA_PASSAPORTE';

-- Cobrança recorrente nos projectos.
CREATE TYPE "BillingType" AS ENUM ('UNICO', 'RECORRENTE');

ALTER TABLE "Project"
  ADD COLUMN "serviceDetails" JSONB,
  ADD COLUMN "billingType" "BillingType" NOT NULL DEFAULT 'UNICO',
  ADD COLUMN "recurrenceMonths" INTEGER,
  ADD COLUMN "nextBillingDate" TIMESTAMP(3),
  ADD COLUMN "recurrenceEndDate" TIMESTAMP(3),
  ADD COLUMN "paymentTermDays" INTEGER NOT NULL DEFAULT 5;

CREATE INDEX "Project_billingType_nextBillingDate_idx" ON "Project"("billingType", "nextBillingDate");

ALTER TABLE "Invoice" ADD COLUMN "recurringCycle" INTEGER;
