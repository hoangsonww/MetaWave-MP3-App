"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

export type ActivityPoint = {
  month: string;
  label: string;
  uploads: number;
  minutes: number;
};

export interface ActivityChartProps {
  data: ActivityPoint[];
}

function formatMinutes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 min";
  if (value < 60) return `${Math.round(value)} min`;
  const hours = Math.floor(value / 60);
  const mins = Math.round(value % 60);
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
}

export function ActivityChart({ data }: ActivityChartProps) {
  const ticks = useMemo(() => {
    if (!data.length) return [];
    const maxUploads = Math.max(...data.map((d) => d.uploads));
    const step = Math.max(1, Math.ceil(maxUploads / 4));
    const tickValues: number[] = [];
    for (let value = 0; value <= maxUploads; value += step) {
      tickValues.push(value);
    }
    if (!tickValues.includes(maxUploads)) {
      tickValues.push(maxUploads);
    }
    return tickValues;
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Not enough history yet to chart uploads.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis
            dataKey="uploads"
            allowDecimals={false}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{
              background: "hsl(var(--card))",
              borderRadius: "0.75rem",
              border: "1px solid hsl(var(--border))",
            }}
            labelFormatter={(value) => `${value}`}
            formatter={(value, name, payload: any) => {
              if (name === "uploads") {
                return [
                  `${value} upload${value === 1 ? "" : "s"}`,
                  "Uploads",
                ];
              }
              if (name === "minutes") {
                return [formatMinutes(value as number), "Listening time"];
              }
              return [value, name];
            }}
          />
          <Bar
            dataKey="uploads"
            radius={[12, 12, 4, 4]}
            fill="hsl(var(--primary))"
            className="drop-shadow-sm"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
