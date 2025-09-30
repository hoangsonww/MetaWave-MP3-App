"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export interface TagSlice {
  name: string;
  value: number;
}

const COLORS = [
  "#6366F1",
  "#EC4899",
  "#22D3EE",
  "#F97316",
  "#10B981",
  "#FACC15",
  "#8B5CF6",
  "#F59E0B",
  "#0EA5E9",
  "#EF4444",
];

export interface TagDistributionChartProps {
  data: TagSlice[];
}

export function TagDistributionChart({ data }: TagDistributionChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Add tags to your tracks to see how your catalog breaks down.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            cornerRadius={6}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
            }}
            formatter={(value: number, name: string) => [
              `${value} track${value === 1 ? "" : "s"}`,
              name,
            ]}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            iconSize={10}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
