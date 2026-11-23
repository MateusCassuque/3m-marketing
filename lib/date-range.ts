/**
 * Filtro de período partilhado por dashboard, facturas, pedidos e finanças.
 * Vive no URL: ?periodo=mes   ou   ?periodo=custom&de=2026-11-01&ate=2026-11-30
 * Os dias são os de Luanda; os limites são meia-noite UTC, como as datas guardadas nos formulários.
 */

export type RangeKey = "hoje" | "semana" | "mes" | "7" | "30" | "90" | "365" | "ano" | "tudo" | "custom";

export const RANGE_PRESETS: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mês" },
  { key: "7", label: "Últimos 7 dias" },
  { key: "30", label: "Últimos 30 dias" },
  { key: "90", label: "Últimos 90 dias" },
  { key: "365", label: "Últimos 12 meses" },
  { key: "ano", label: "Este ano" },
  { key: "tudo", label: "Todo o período" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export interface ResolvedRange {
  key: RangeKey;
  /** Início (inclusivo) — null = sem limite. */
  from: Date | null;
  /** Fim (EXCLUSIVO) — null = sem limite. */
  to: Date | null;
  label: string;
  /** Datas "AAAA-MM-DD" para pré-preencher o calendário. */
  de: string;
  ate: string;
  /** Parâmetros para manter o período ao mudar de página/filtro. */
  params: { periodo?: string; de?: string; ate?: string };
}

function todayUtcMidnight(): Date {
  const text = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Luanda",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${text}T00:00:00.000Z`);
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function formatDay(d: Date) {
  const [y, m, day] = isoDay(d).split("-");
  return `${day}/${m}/${y}`;
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function resolveRange(
  raw: { periodo?: string | string[]; de?: string | string[]; ate?: string | string[] },
  fallback: RangeKey = "tudo",
): ResolvedRange {
  const requested = one(raw.periodo);
  const known = RANGE_PRESETS.some((p) => p.key === requested) || requested === "custom";
  let key: RangeKey = known ? (requested as RangeKey) : fallback;

  const today = todayUtcMidnight();
  let from: Date | null = null;
  let to: Date | null = null;

  if (key === "custom") {
    const de = one(raw.de);
    const ate = one(raw.ate);
    if (ISO_DAY.test(de) || ISO_DAY.test(ate)) {
      let start = ISO_DAY.test(de) ? new Date(`${de}T00:00:00.000Z`) : null;
      let end = ISO_DAY.test(ate) ? new Date(`${ate}T00:00:00.000Z`) : null;
      if (start && end && start > end) [start, end] = [end, start];
      from = start;
      to = end ? new Date(end.getTime() + DAY_MS) : null;
    } else {
      key = fallback === "custom" ? "tudo" : fallback;
    }
  }

  if (key !== "custom") {
    if (key === "hoje") {
      from = today;
      to = new Date(today.getTime() + DAY_MS);
    } else if (key === "semana") {
      const offset = (today.getUTCDay() + 6) % 7; // segunda-feira = 0
      from = new Date(today.getTime() - offset * DAY_MS);
      to = new Date(from.getTime() + 7 * DAY_MS);
    } else if (key === "mes") {
      from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
    } else if (key === "ano") {
      from = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
      to = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1));
    } else if (key === "7" || key === "30" || key === "90" || key === "365") {
      const n = Number(key);
      from = new Date(today.getTime() - (n - 1) * DAY_MS);
      to = new Date(today.getTime() + DAY_MS);
    }
  }

  let label: string;
  if (key === "custom") {
    const start = from ? formatDay(from) : "início";
    const end = to ? formatDay(new Date(to.getTime() - DAY_MS)) : "hoje";
    label = `${start} – ${end}`;
  } else {
    label = RANGE_PRESETS.find((p) => p.key === key)?.label ?? "Todo o período";
  }

  const de = from ? isoDay(from) : "";
  const ate = to ? isoDay(new Date(to.getTime() - DAY_MS)) : "";

  const params: ResolvedRange["params"] =
    key === "custom" ? { periodo: "custom", de: de || undefined, ate: ate || undefined } : { periodo: key };

  return { key, from, to, label, de, ate, params };
}

/** Condição `{ gte, lt }` do Prisma para um campo de data (undefined = sem filtro). */
export function rangeWhere(range: ResolvedRange): { gte?: Date; lt?: Date } | undefined {
  if (!range.from && !range.to) return undefined;
  return {
    ...(range.from ? { gte: range.from } : {}),
    ...(range.to ? { lt: range.to } : {}),
  };
}

/** Período imediatamente anterior, com a mesma duração (para comparar "vs. período anterior"). */
export function previousRange(range: ResolvedRange): { gte: Date; lt: Date } | null {
  if (!range.from || !range.to) return null;
  const length = range.to.getTime() - range.from.getTime();
  return { gte: new Date(range.from.getTime() - length), lt: range.from };
}
