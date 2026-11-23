-- Cliente: só o nome e o telefone são obrigatórios (e-mail passa a opcional).
ALTER TABLE "Client" ALTER COLUMN "email" DROP NOT NULL;

-- Contas (onde está o dinheiro) e despesas.
CREATE TYPE "ExpenseCategory" AS ENUM (
  'SALARIOS', 'RENDA', 'FERRAMENTAS', 'MARKETING', 'TRANSPORTE',
  'IMPOSTOS', 'EQUIPAMENTO', 'SERVICOS_TERCEIROS', 'OUTROS'
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'OUTROS',
    "supplier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Invoice" ADD COLUMN "accountId" TEXT;

CREATE INDEX "Expense_date_idx" ON "Expense"("date");
CREATE INDEX "Expense_accountId_idx" ON "Expense"("accountId");
CREATE INDEX "Expense_projectId_idx" ON "Expense"("projectId");
CREATE INDEX "Invoice_accountId_idx" ON "Invoice"("accountId");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
