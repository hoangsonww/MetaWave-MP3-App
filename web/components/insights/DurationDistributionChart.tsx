"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export interface DurationBucket {
  bucket: string;
  tracks: number;
}

export interface DurationDistributionChartProps {
  data: DurationBucket[];
}

export function DurationDistributionChart({
  data,
}: DurationDistributionChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Upload tracks with duration metadata to view listening distribution.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
            contentStyle={{
              background: "hsl(var(--card))",
              borderRadius: "0.75rem",
              border: "1px solid hsl(var(--border))",
            }}
            formatter={(value: number) => [
              `${value} track${value === 1 ? "" : "s"}`,
              "Tracks",
            ]}
          />
          <Area
            type="monotone"
            dataKey="tracks"
            stroke="hsl(var(--primary))"
            fill="url(#durationGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
