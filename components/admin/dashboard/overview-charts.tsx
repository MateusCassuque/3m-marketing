"use client";

import {
  Area,
  AreaChart,
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

import { formatCurrency } from "@/lib/utils";

const GRID = "#EDF1F7";
const TICK = { fontSize: 11, fill: "#8A97AD" };
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "none",
  fontSize: 12,
  boxShadow: "0 12px 32px -12px rgba(4,19,46,.25)",
};

const SERIES = ["#0098DC", "#0A2A5E", "#FF7F0A", "#5CC8F2", "#4F6C9B", "#B3C2DB", "#FF9B3D"];

function Empty({ text, height = 240 }: { text: string; height?: number }) {
  return (
    <div className="flex items-center justify-center text-center text-sm text-muted-foreground" style={{ height }}>
      {text}
    </div>
  );
}

export function LeadsTrendChart({ data }: { data: { label: string; leads: number }[] }) {
  if (data.every((d) => d.leads === 0)) return <Empty text="Ainda não há leads neste período." />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
        <defs>
          <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0098DC" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#0098DC" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis allowDecimals={false} tick={TICK} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ stroke: "#CBD5E1", strokeDasharray: 3 }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [Number(value), "Leads"]} />
        <Area type="monotone" dataKey="leads" stroke="#0098DC" strokeWidth={2} fill="url(#leadsFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: { month: string; facturado: number; recebido: number }[] }) {
  if (data.every((d) => d.facturado === 0 && d.recebido === 0)) {
    return <Empty text="Ainda não há facturas emitidas." height={260} />;
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
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
        />
        <Bar dataKey="facturado" name="Facturado" fill="#D5DEEC" radius={[5, 5, 0, 0]} maxBarSize={22} />
        <Bar dataKey="recebido" name="Recebido" fill="#0098DC" radius={[5, 5, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServiceDonut({ data }: { data: { service: string; total: number }[] }) {
  if (data.length === 0) return <Empty text="Sem leads neste período." />;
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="service" innerRadius={56} outerRadius={78} paddingAngle={3} cornerRadius={4} stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={SERIES[i % SERIES.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-navy-700">{total}</span>
          <span className="text-[11px] text-muted-foreground">leads</span>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {data.slice(0, 5).map((d, i) => (
          <li key={d.service} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 text-navy-600">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
              <span className="truncate">{d.service}</span>
            </span>
            <span className="font-semibold text-navy-700">{d.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
