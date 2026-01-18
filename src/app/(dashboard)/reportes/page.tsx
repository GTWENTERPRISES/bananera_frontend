"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ExportButton } from "@/src/components/shared/export-button";
import { useApp } from "@/src/contexts/app-context";
import { BarChart3, MapPin } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { AIInsights } from "@/src/components/reportes/ai-insights";
import { ReporteGenerator } from "@/src/components/reportes/reporte-generator";
import { AnalyticsCharts } from "@/src/components/reportes/analytics-charts";
import { ComparativaFincas } from "@/src/components/reportes/comparativa-fincas";
import { KPISummary } from "@/src/components/reportes/kpi-summary";

export default function ReportesPage() {
  const { cosechas, fincas, currentUser } = useApp();
  const [periodo, setPeriodo] = useState("mensual");
  const [añoSeleccionado, setAñoSeleccionado] = useState("2025");

  // Helper para obtener nombre de finca desde UUID
  const getFincaNombre = (fincaId: string, fincaNombre?: string): string => {
    if (fincaNombre && fincaNombre !== 'Sin asignar') return fincaNombre;
    const f = fincas.find(f => f.id === fincaId || f.nombre === fincaId);
    return f?.nombre || fincaId;
  };

  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return null;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada || fi.nombre === currentUser.fincaAsignada);
    return f?.nombre || currentUser.fincaAsignada;
  })();
  const esFiltrado = currentUser?.rol === 'supervisor_finca' || currentUser?.rol === 'bodeguero';

  const cosechasFiltradas = useMemo(() => {
    return cosechas.filter((c) => c.año.toString() === añoSeleccionado);
  }, [cosechas, añoSeleccionado]);

  const getDateOfISOWeek = (week: number, year: number) => {
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay();
    const ISOWeekStart = new Date(simple);
    if (dow <= 4) {
      ISOWeekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    } else {
      ISOWeekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
    }
    const midWeek = new Date(ISOWeekStart);
    midWeek.setUTCDate(ISOWeekStart.getUTCDate() + 3);
    return midWeek;
  };

  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const produccionMensual = useMemo(() => {
    return meses.map((mes, idx) => {
      const mesNum = idx; // 0-11
      const registrosMes = cosechasFiltradas.filter((c) => {
        const d = getDateOfISOWeek(Number(c.semana), Number(añoSeleccionado));
        return d.getUTCMonth() === mesNum;
      });
      return {
        mes,
        BABY: registrosMes
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "BABY")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        SOLO: registrosMes
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "SOLO")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        LAURITA: registrosMes
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "LAURITA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        MARAVILLA: registrosMes
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "MARAVILLA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      };
    });
  }, [cosechasFiltradas, añoSeleccionado]);

  const semanasDisponibles = useMemo(() => {
    return Array.from(new Set(cosechasFiltradas.map((c) => c.semana))).sort(
      (a: number, b: number) => Number(a) - Number(b)
    );
  }, [cosechasFiltradas]);

  const produccionSemanal = useMemo(() => {
    return semanasDisponibles.map((sem) => ({
      semana: `Sem ${sem}`,
      BABY: cosechasFiltradas
        .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "BABY" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
      SOLO: cosechasFiltradas
        .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "SOLO" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
      LAURITA: cosechasFiltradas
        .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "LAURITA" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
      MARAVILLA: cosechasFiltradas
        .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "MARAVILLA" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
    }));
  }, [cosechasFiltradas, semanasDisponibles]);

  const produccionAnual = useMemo(() => {
    return [
      {
        año: añoSeleccionado,
        BABY: cosechasFiltradas
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "BABY")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        SOLO: cosechasFiltradas
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "SOLO")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        LAURITA: cosechasFiltradas
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "LAURITA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        MARAVILLA: cosechasFiltradas
          .filter((c) => getFincaNombre(c.finca, c.fincaNombre) === "MARAVILLA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      },
    ];
  }, [cosechasFiltradas, añoSeleccionado]);

  const currentData = useMemo(() => {
    if (periodo === "mensual") return produccionMensual;
    if (periodo === "semanal") return produccionSemanal;
    return produccionAnual;
  }, [periodo, produccionMensual, produccionSemanal, produccionAnual]);

  const currentHeaders = useMemo(() => {
    if (periodo === "mensual")
      return ["Mes", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
    if (periodo === "semanal")
      return ["Semana", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
    return ["Año", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
  }, [periodo]);

  const currentKeys = useMemo(() => {
    if (periodo === "mensual")
      return ["mes", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
    if (periodo === "semanal")
      return ["semana", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
    return ["año", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
  }, [periodo]);

  const currentTitle = useMemo(() => {
    if (periodo === "mensual")
      return `Reporte Mensual de Producción (${añoSeleccionado})`;
    if (periodo === "semanal")
      return `Reporte Semanal de Producción (${añoSeleccionado})`;
    return `Reporte Anual de Producción (${añoSeleccionado})`;
  }, [periodo, añoSeleccionado]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Generar Reporte</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={añoSeleccionado} onValueChange={setAñoSeleccionado}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>

            <Tabs
              value={periodo}
              onValueChange={setPeriodo}
              className="w-[260px]"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="semanal">Semanal</TabsTrigger>
                <TabsTrigger value="mensual">Mensual</TabsTrigger>
                <TabsTrigger value="anual">Anual</TabsTrigger>
              </TabsList>
              <TabsContent value="semanal" />
              <TabsContent value="mensual" />
              <TabsContent value="anual" />
            </Tabs>

            <ExportButton
              data={currentData}
              headers={currentHeaders}
              keys={currentKeys}
              title={currentTitle}
              filename="reportes-generales"
            />
          </div>
        </CardContent>
      </Card>
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-foreground">
            Reportes y Analytics
          </h1>
          {esFiltrado && fincaAsignadaNombre && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {fincaAsignadaNombre}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {esFiltrado && fincaAsignadaNombre ? `Análisis de ${fincaAsignadaNombre}` : "Análisis inteligente con insights generados por IA"}
        </p>
      </div>

      <KPISummary />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AIInsights />
        </div>
        <ReporteGenerator />
      </div>

      <AnalyticsCharts año={añoSeleccionado} periodo={periodo} />

      <ComparativaFincas año={añoSeleccionado} periodo={periodo} />
    </div>
  );
}
