"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function TrendChart() {
  // Mock data for last 12 weeks
  const data = [
    { semana: "S40", ratio: 2.15, merma: 3.8 },
    { semana: "S41", ratio: 2.18, merma: 3.5 },
    { semana: "S42", ratio: 2.22, merma: 3.2 },
    { semana: "S43", ratio: 2.19, merma: 3.6 },
    { semana: "S44", ratio: 2.25, merma: 3.1 },
    { semana: "S45", ratio: 2.21, merma: 3.4 },
    { semana: "S46", ratio: 2.28, merma: 2.9 },
    { semana: "S47", ratio: 2.24, merma: 3.3 },
    { semana: "S48", ratio: 2.3, merma: 2.8 },
    { semana: "S49", ratio: 2.26, merma: 3.2 },
    { semana: "S50", ratio: 2.23, merma: 3.5 },
    { semana: "S51", ratio: 2.2, merma: 3.6 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Ratios - Últimas 12 Semanas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="semana" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="ratio"
              stroke="var(--chart-1)"
              strokeWidth={2}
              name="Ratio"
            />
            <Line
              type="monotone"
              dataKey="merma"
              stroke="var(--chart-3)"
              strokeWidth={2}
              name="Merma %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
