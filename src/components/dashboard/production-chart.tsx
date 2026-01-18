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
  const { getFilteredCosechas } = useApp();
  const cosechas = getFilteredCosechas();
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="finca" stroke="var(--muted-foreground)" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: isMobile ? "12px" : "14px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? "12px" : "14px" }} />
            <Bar dataKey="cajas" fill="var(--chart-1)" name="Cajas Producidas" />
            <Bar dataKey="racimos" fill="var(--chart-2)" name="Racimos Recuperados" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
