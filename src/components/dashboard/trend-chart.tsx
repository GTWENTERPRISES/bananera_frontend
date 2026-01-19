"use client";

import { useMemo } from "react";
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
import { useApp } from "@/src/contexts/app-context";

export function TrendChart() {
  const { cosechas } = useApp();
  
  // Agrupar cosechas por semana y calcular ratio/merma promedio
  const data = useMemo(() => {
    const grouped: Record<string, { ratioTotal: number; mermaTotal: number; count: number; cajas: number }> = {};
    
    cosechas.forEach((c) => {
      const key = `S${c.semana}`;
      if (!grouped[key]) {
        grouped[key] = { ratioTotal: 0, mermaTotal: 0, count: 0, cajas: 0 };
      }
      grouped[key].ratioTotal += Number(c.ratio) || 0;
      grouped[key].mermaTotal += Number(c.merma) || 0;
      grouped[key].count += 1;
      grouped[key].cajas += c.cajasProducidas || 0;
    });
    
    return Object.entries(grouped)
      .map(([semana, values]) => ({
        semana,
        ratio: values.count > 0 ? Number((values.ratioTotal / values.count).toFixed(2)) : 0,
        merma: values.count > 0 ? Number((values.mermaTotal / values.count).toFixed(2)) : 0,
        cajas: values.cajas,
      }))
      .sort((a, b) => {
        const numA = parseInt(a.semana.replace('S', ''));
        const numB = parseInt(b.semana.replace('S', ''));
        return numA - numB;
      })
      .slice(-12); // Últimas 12 semanas
  }, [cosechas]);

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
