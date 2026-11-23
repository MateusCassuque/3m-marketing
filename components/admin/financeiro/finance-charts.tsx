"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

const GRID = "#EDF1F7";
const TICK = { fontSize: 11, fill: "#8A97AD" };

/** Entradas (recebido) vs. saídas (despesas) por mês. */
export function CashflowChart({ data }: { data: { month: string; recebido: number; despesas: number }[] }) {
  if (data.every((d) => d.recebido === 0 && d.despesas === 0)) {
    return (
      <div className="flex h-[260px] items-center justify-center text-center text-sm text-muted-foreground">
        Ainda não há recebimentos nem despesas nestes meses.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={3} barCategoryGap="28%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
        <YAxis
          tick={TICK}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,152,220,0.05)" }}
          contentStyle={{ borderRadius: 12, border: "none", fontSize: 12, boxShadow: "0 12px 32px -12px rgba(4,19,46,.25)" }}
          formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
        />
        <Bar dataKey="recebido" name="Recebido" fill="#0098DC" radius={[5, 5, 0, 0]} maxBarSize={22} />
        <Bar dataKey="despesas" name="Despesas" fill="#FF7F0A" radius={[5, 5, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
