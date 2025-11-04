"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useApp } from "@/src/contexts/app-context";
import { useIsMobile } from "@/src/hooks/use-mobile";

export function ProductionChart() {
  const { cosechas } = useApp();
  const isMobile = useIsMobile();

  const data = cosechas.map((c) => ({
    finca: c.finca,
    cajas: c.cajasProducidas,
    racimos: c.racimosRecuperados,
  }));

  return (
    <Card className="responsive-container">
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Producción Semanal por Finca</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="finca" className="text-xs" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis className="text-xs" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: isMobile ? "12px" : "14px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? "12px" : "14px" }} />
            <Bar
              dataKey="cajas"
              fill="hsl(var(--chart-1))"
              name="Cajas Producidas"
            />
            <Bar
              dataKey="racimos"
              fill="hsl(var(--chart-2))"
              name="Racimos Recuperados"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
