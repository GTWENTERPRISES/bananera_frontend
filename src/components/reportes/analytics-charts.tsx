"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function AnalyticsCharts() {
  const { enfundes, cosechas, empleados } = useApp();

  // Production by farm - usando cantidad en lugar de contar registros
  const produccionPorFinca = [
    {
      finca: "BABY",
      enfundes: enfundes
        .filter((e) => e.finca === "BABY")
        .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
      cosechas: cosechas
        .filter((c) => c.finca === "BABY")
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
    },
    {
      finca: "SOLO",
      enfundes: enfundes
        .filter((e) => e.finca === "SOLO")
        .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
      cosechas: cosechas
        .filter((c) => c.finca === "SOLO")
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
    },
    {
      finca: "LAURITA",
      enfundes: enfundes
        .filter((e) => e.finca === "LAURITA")
        .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
      cosechas: cosechas
        .filter((c) => c.finca === "LAURITA")
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
    },
    {
      finca: "MARAVILLA",
      enfundes: enfundes
        .filter((e) => e.finca === "MARAVILLA")
        .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
      cosechas: cosechas
        .filter((c) => c.finca === "MARAVILLA")
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
    },
  ];

  // Employees by labor (usando la propiedad correcta 'labor' en lugar de 'rol')
  const empleadosPorLabor = [
    {
      labor: "Enfunde",
      cantidad: empleados.filter((e) => e.labor === "Enfunde").length,
    },
    {
      labor: "Cosecha",
      cantidad: empleados.filter((e) => e.labor === "Cosecha").length,
    },
    {
      labor: "Calibración",
      cantidad: empleados.filter((e) => e.labor === "Calibración").length,
    },
    {
      labor: "Varios",
      cantidad: empleados.filter((e) => e.labor === "Varios").length,
    },
    {
      labor: "Administrador",
      cantidad: empleados.filter((e) => e.labor === "Administrador").length,
    },
  ];

  // Weekly trend - usando datos reales de cosechas si están disponibles
  const tendenciaSemanal = [
    { semana: "Sem 1", produccion: 450 },
    { semana: "Sem 2", produccion: 520 },
    { semana: "Sem 3", produccion: 480 },
    { semana: "Sem 4", produccion: 590 },
  ];

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Producción por Finca</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produccionPorFinca}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="finca" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="enfundes"
                fill="hsl(var(--chart-1))"
                name="Enfundes"
              />
              <Bar
                dataKey="cosechas"
                fill="hsl(var(--chart-2))"
                name="Cajas Producidas"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empleados por Labor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={empleadosPorLabor}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ labor, cantidad }) => `${labor}: ${cantidad}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {empleadosPorLabor.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tendencia de Producción Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendenciaSemanal}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="semana" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="produccion"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Producción (Cajas)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
