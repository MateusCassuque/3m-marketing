"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

const GRID = "#E2E8F0";
const TICK = { fontSize: 11, fill: "#64748B" };
const TOOLTIP_STYLE = { borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12, boxShadow: "0 10px 30px -14px rgba(4,19,46,.25)" };

const SERIES = ["#0098DC", "#0A2A5E", "#FF7F0A", "#5CC8F2", "#007EC7", "#B3C2DB", "#FF9B3D"];

function Empty({ text }: { text: string }) {
  return <div className="flex h-[260px] items-center justify-center text-center text-sm text-muted-foreground">{text}</div>;
}

export function LeadsTrendChart({ data }: { data: { label: string; leads: number }[] }) {
  if (data.every((d) => d.leads === 0)) return <Empty text="Ainda não há leads neste período." />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0098DC" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0098DC" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={24} />
        <YAxis allowDecimals={false} tick={TICK} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [Number(value), "Leads"]} />
        <Area type="monotone" dataKey="leads" stroke="#0098DC" strokeWidth={2.5} fill="url(#leadsFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: { month: string; facturado: number; recebido: number }[] }) {
  if (data.every((d) => d.facturado === 0 && d.recebido === 0)) {
    return <Empty text="Ainda não há facturas emitidas." />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis
          tick={TICK}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,152,220,0.06)" }}
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="facturado" name="Facturado" fill="#B3C2DB" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="recebido" name="Recebido" fill="#0098DC" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServiceDonut({ data }: { data: { service: string; total: number }[] }) {
  if (data.length === 0) return <Empty text="Sem leads neste período." />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="service"
          innerRadius={58}
          outerRadius={92}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={SERIES[i % SERIES.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
