"use client";

import { useMemo } from "react";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsChartsProps {
  año?: string;
  periodo?: string;
}

export function AnalyticsCharts({ año = "2025", periodo = "mensual" }: AnalyticsChartsProps) {
  const { enfundes, cosechas, fincas: fincasData } = useApp();

  // Helper para obtener nombre de finca desde UUID
  const getFincaNombre = (fincaId: string, fincaNombre?: string): string => {
    if (fincaNombre && fincaNombre !== 'Sin asignar') return fincaNombre;
    const f = fincasData.find(f => f.id === fincaId || f.nombre === fincaId);
    return f?.nombre || fincaId;
  };

  // Filtrar por año
  const enfundesFiltrados = useMemo(() => 
    enfundes.filter(e => e.año.toString() === año), [enfundes, año]);
  const cosechasFiltradas = useMemo(() => 
    cosechas.filter(c => c.año.toString() === año), [cosechas, año]);

  // Filtrar según periodo
  const getDataFiltradaPorPeriodo = useMemo(() => {
    if (periodo === "semanal") {
      // Últimas 4 semanas disponibles
      const semanasUnicas = [...new Set(cosechasFiltradas.map(c => c.semana))].sort((a, b) => b - a).slice(0, 4);
      const semanasEnfundes = [...new Set(enfundesFiltrados.map(e => e.semana))].sort((a, b) => b - a).slice(0, 4);
      return {
        cosechas: cosechasFiltradas.filter(c => semanasUnicas.includes(c.semana)),
        enfundes: enfundesFiltrados.filter(e => semanasEnfundes.includes(e.semana))
      };
    }
    // Mensual y Anual usan todos los datos del año
    return { cosechas: cosechasFiltradas, enfundes: enfundesFiltrados };
  }, [cosechasFiltradas, enfundesFiltrados, periodo]);

  // Production by farm - usando cantidad en lugar de contar registros
  const produccionPorFinca = useMemo(() => {
    const { cosechas: cosechasData, enfundes: enfundesData } = getDataFiltradaPorPeriodo;
    return [
      {
        finca: "BABY",
        enfundes: enfundesData
          .filter((e) => getFincaNombre(e.finca, e.fincaNombre) === "BABY")
          .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
        cosechas: cosechasData
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "BABY")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      },
      {
        finca: "SOLO",
        enfundes: enfundesData
          .filter((e) => getFincaNombre(e.finca, e.fincaNombre) === "SOLO")
          .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
        cosechas: cosechasData
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "SOLO")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      },
      {
        finca: "LAURITA",
        enfundes: enfundesData
          .filter((e) => getFincaNombre(e.finca, e.fincaNombre) === "LAURITA")
          .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
        cosechas: cosechasData
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "LAURITA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      },
      {
        finca: "MARAVILLA",
        enfundes: enfundesData
          .filter((e) => getFincaNombre(e.finca, e.fincaNombre) === "MARAVILLA")
          .reduce((sum, e) => sum + e.cantidadEnfundes, 0),
        cosechas: cosechasData
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "MARAVILLA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      },
    ];
  }, [getDataFiltradaPorPeriodo, fincasData]);

  // Título dinámico para Producción por Finca
  const tituloProduccion = periodo === "semanal" ? "Producción por Finca (Últimas 4 semanas)" : 
                           periodo === "mensual" ? `Producción por Finca (${año})` : 
                           `Producción por Finca - Total ${año}`;


  // Meses para agrupación mensual
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Tendencia según periodo seleccionado
  const tendenciaData = useMemo(() => {
    if (periodo === "semanal") {
      const semanasUnicas = [...new Set(cosechasFiltradas.map((c) => c.semana))].sort((a, b) => a - b).slice(-12);
      if (semanasUnicas.length === 0) {
        return [{ label: "Sin datos", produccion: 0 }];
      }
      return semanasUnicas.map((sem) => ({
        label: `Sem ${sem}`,
        produccion: cosechasFiltradas
          .filter((c) => c.semana === sem)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      }));
    } else if (periodo === "mensual") {
      return meses.map((mes, idx) => {
        const mesNum = idx + 1;
        const cosechasMes = cosechasFiltradas.filter((c) => {
          const semana = c.semana;
          const mesCalculado = Math.ceil(semana / 4.33);
          return mesCalculado === mesNum;
        });
        return {
          label: mes,
          produccion: cosechasMes.reduce((sum, c) => sum + c.cajasProducidas, 0),
        };
      });
    } else {
      // Anual - mostrar total del año
      return [{
        label: año,
        produccion: cosechasFiltradas.reduce((sum, c) => sum + c.cajasProducidas, 0),
      }];
    }
  }, [cosechasFiltradas, periodo, año]);

  // Título dinámico según periodo
  const tituloTendencia = periodo === "semanal" ? "Tendencia Semanal" : 
                          periodo === "mensual" ? "Tendencia Mensual" : 
                          "Total Anual";

  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{tituloProduccion}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produccionPorFinca}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="finca" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="enfundes"
                fill="var(--chart-1)"
                name="Enfundes"
              />
              <Bar
                dataKey="cosechas"
                fill="var(--chart-2)"
                name="Cajas Producidas"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tituloTendencia} de Producción ({año})</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tendenciaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="produccion"
                fill="var(--chart-1)"
                name="Producción (Cajas)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
