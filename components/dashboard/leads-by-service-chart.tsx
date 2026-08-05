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

interface ChartDatum {
  service: string;
  total: number;
}

export function LeadsByServiceChart({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Ainda não há leads suficientes para exibir o gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="service"
          tick={{ fontSize: 11, fill: "#64748B" }}
          tickLine={false}
          axisLine={{ stroke: "#E2E8F0" }}
          interval={0}
          angle={-12}
          textAnchor="end"
          height={50}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(21, 131, 166, 0.06)" }}
          contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
        />
        <Bar dataKey="total" fill="#1583A6" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
