/**
 * Cálculo do valor em falta de um pedido facturado em parcelas.
 * Código puro (sem base de dados) — usado no formulário, em tempo real, e no servidor.
 */

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface BalanceInput {
  /** Valor total do pedido. */
  total: number;
  /** Soma das facturas anteriores deste pedido (sem canceladas). */
  previouslyInvoiced: number;
  /** Valor desta factura. */
  amount: number;
  /** "Não falta mais nada": força o valor em falta a zero. */
  settles?: boolean;
}

export interface Balance {
  total: number;
  previouslyInvoiced: number;
  amount: number;
  /** Facturado até aqui, incluindo esta factura. */
  invoicedAfter: number;
  /** Quanto falta facturar depois desta factura. */
  remaining: number;
  /** Quanto se facturou a mais do que o valor do pedido (0 se não há excesso). */
  excess: number;
  /** Quanto faltava antes desta factura (o que seria "o restante"). */
  remainingBefore: number;
}

export function computeBalance({ total, previouslyInvoiced, amount, settles = false }: BalanceInput): Balance {
  const invoicedAfter = round2(previouslyInvoiced + amount);
  const remainingRaw = round2(total - invoicedAfter);

  return {
    total: round2(total),
    previouslyInvoiced: round2(previouslyInvoiced),
    amount: round2(amount),
    invoicedAfter,
    remaining: settles ? 0 : Math.max(remainingRaw, 0),
    excess: Math.max(-remainingRaw, 0),
    remainingBefore: Math.max(round2(total - previouslyInvoiced), 0),
  };
}
