"use client";

import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyDatum {
  month: string;
  total: number;
}

interface StatusDatum {
  status: string;
  total: number;
  color: string;
}


export function MonthlyRevenueChart({ data }: { data: MonthlyDatum[] }) {
  if (data.every((d) => d.total === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Ainda não há faturas suficientes para exibir o gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#64748B" }}
          tickLine={false}
          axisLine={{ stroke: "#E2E8F0" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748B" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${Math.round(value / 1000)}k`}
        />
        <Tooltip
          cursor={{ fill: "rgba(21, 131, 166, 0.06)" }}
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
        />
        <Bar dataKey="total" fill="#1583A6" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InvoiceStatusChart({ data }: { data: StatusDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Ainda não há faturas para exibir a distribuição.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="status"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
