/**
 * Server Components não podem passar instâncias de `Decimal` (Prisma) para
 * Client Components — só objetos simples. Estas funções convertem os
 * campos monetários para `number` puro antes de repassar para a UI.
 */

export function toNumberOrNull(value: unknown) {
  return value === null || value === undefined ? null : Number(value);
}

export function parseDateOrNull(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
