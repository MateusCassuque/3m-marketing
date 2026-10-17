/** Número de registos por página nas listas do painel. */
export const PAGE_SIZE = 10;

export function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Calcula página válida (nunca fora do intervalo) e os valores skip/take do Prisma. */
export function paginate(total: number, requested: number) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, requested), totalPages);
  return { page, totalPages, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
}

export function firstParam(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}
