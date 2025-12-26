"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
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
import { Button } from "@/src/components/ui/button";
import { ExportButton } from "@/src/components/shared/export-button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Download, Filter, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useApp } from "@/src/contexts/app-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Slider } from "@/src/components/ui/slider";
type PrecioMercado = { mes: string; precio: number };
type ProduccionMensualPorFinca = { mes: string; BABY: number; SOLO: number; LAURITA: number; MARAVILLA: number };
type ProduccionSemanalPorFinca = { semana: string; BABY: number; SOLO: number; LAURITA: number; MARAVILLA: number };
type CalidadMensual = { mes: string; premium: number; estandar: number; rechazo: number };
type RendimientoMensual = { mes: string; rendimiento: number };
type EstadisticasFincas = Record<"BABY" | "SOLO" | "LAURITA" | "MARAVILLA", { cajas: number; tendencia: string; positivo: boolean }>;

export default function ReportesProduccionPage() {
  const { enfundes, cosechas } = useApp();
  const [periodo, setPeriodo] = useState("mensual");
  const [añoSeleccionado, setAñoSeleccionado] = useState("2025");
  const [tab, setTab] = useState("volumen");
  const [periodoOpen, setPeriodoOpen] = useState(false);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [fincasSeleccionadas, setFincasSeleccionadas] = useState<string[]>(["BABY","SOLO","LAURITA","MARAVILLA"]);
  const [semanaInicio, setSemanaInicio] = useState<string>("1");
  const [semanaFin, setSemanaFin] = useState<string>("52");
  const [mesInicio, setMesInicio] = useState<string>("1");
  const [mesFin, setMesFin] = useState<string>("12");

  // Parámetros y estado para precios de mercado
  const [commodity, setCommodity] = useState("banana");
  const [currency, setCurrency] = useState("USD");
  const [unit, setUnit] = useState("caja");
  const [market, setMarket] = useState("EC");
  const [range, setRange] = useState("6m");
  const [preciosMercado, setPreciosMercado] = useState<PrecioMercado[]>([]);
  const [cargandoPrecios, setCargandoPrecios] = useState(false);
  const [errorPrecios, setErrorPrecios] = useState<string | null>(null);

  // Altura fija para los gráficos
  const chartHeight = 400;

  // Derivados de precios
  const currencySymbol = useMemo(() => (currency === "USD" ? "$" : currency === "EUR" ? "€" : "$"), [currency]);
  const precioActual = useMemo(() => (preciosMercado.length ? preciosMercado[preciosMercado.length - 1].precio : 0), [preciosMercado]);
  const precioAnterior = useMemo(() => (preciosMercado.length > 1 ? preciosMercado[preciosMercado.length - 2].precio : 0), [preciosMercado]);
  const variacionMes = useMemo(() => (precioAnterior ? ((precioActual - precioAnterior) / precioAnterior) * 100 : 0), [precioActual, precioAnterior]);
  const promedio = useMemo(
    () => (preciosMercado.length ? preciosMercado.reduce((sum, p) => sum + p.precio, 0) / preciosMercado.length : 0),
    [preciosMercado]
  );
  const yDomain = useMemo(() => {
    if (!preciosMercado.length) return [0, 10];
    const min = Math.min(...preciosMercado.map((p) => p.precio));
    const max = Math.max(...preciosMercado.map((p) => p.precio));
    return [Math.floor(min - 0.5), Math.ceil(max + 0.5)];
  }, [preciosMercado]);

  // Fetch precios de mercado cuando cambian parámetros
  useEffect(() => {
    setCargandoPrecios(true);
    setErrorPrecios(null);
    const params = new URLSearchParams({ commodity, currency, unit, range, market });
    fetch(`/api/precios?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const data = (json?.data as { mes: string; precio: number }[]) || [];
        setPreciosMercado(data);
      })
      .catch(() => setErrorPrecios("No se pudo cargar precios"))
      .finally(() => setCargandoPrecios(false));
  }, [commodity, currency, unit, range, market]);

  // Utilidades para normalizar rangos
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const setWeekRange = (values: number[]) => {
    const [a, b] = values;
    const start = clamp(Math.min(a, b), 1, 52);
    const end = clamp(Math.max(a, b), 1, 52);
    setSemanaInicio(String(start));
    setSemanaFin(String(end));
  };

  // Procesar datos reales del contexto
  const {
    produccionMensual,
    produccionSemanal,
    calidadProduccion,
    rendimientoData,
    estadisticasFincas,
  } = useMemo<{
    produccionMensual: ProduccionMensualPorFinca[];
    produccionSemanal: ProduccionSemanalPorFinca[];
    calidadProduccion: CalidadMensual[];
    rendimientoData: RendimientoMensual[];
    estadisticasFincas: EstadisticasFincas;
  }>(() => {
    // Filtrar datos por año seleccionado
    const mapMes = (sem: number) => Math.ceil(sem / 4.33);
    const enfundesFiltradosBase = enfundes.filter(
      (e) => e.año.toString() === añoSeleccionado && fincasSeleccionadas.includes(e.finca)
    );
    const cosechasFiltradasBase = cosechas.filter(
      (c) => c.año.toString() === añoSeleccionado && fincasSeleccionadas.includes(c.finca)
    );
    const enfundesFiltrados = enfundesFiltradosBase.filter((e) =>
      periodo === "mensual"
        ? mapMes(e.semana) >= Number(mesInicio) && mapMes(e.semana) <= Number(mesFin)
        : e.semana >= Number(semanaInicio) && e.semana <= Number(semanaFin)
    );
    const cosechasFiltradas = cosechasFiltradasBase.filter((c) =>
      periodo === "mensual"
        ? mapMes(c.semana) >= Number(mesInicio) && mapMes(c.semana) <= Number(mesFin)
        : c.semana >= Number(semanaInicio) && c.semana <= Number(semanaFin)
    );

    // Producción mensual por finca
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
    const produccionMensual: ProduccionMensualPorFinca[] = meses.map((mes, index) => {
      const mesNum = index + 1;
      return {
        mes,
        BABY: cosechasFiltradas
          .filter((c) => c.finca === "BABY" && Math.ceil(c.semana / 4.33) === mesNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        SOLO: cosechasFiltradas
          .filter((c) => c.finca === "SOLO" && Math.ceil(c.semana / 4.33) === mesNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        LAURITA: cosechasFiltradas
          .filter((c) => c.finca === "LAURITA" && Math.ceil(c.semana / 4.33) === mesNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        MARAVILLA: cosechasFiltradas
          .filter((c) => c.finca === "MARAVILLA" && Math.ceil(c.semana / 4.33) === mesNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      };
    });

    // Producción semanal en rango seleccionado (genera continuidad aunque falte data)
    const startSem = clamp(Number(semanaInicio), 1, 52);
    const endSem = clamp(Number(semanaFin), 1, 52);
    const realStart = Math.min(startSem, endSem);
    const realEnd = Math.max(startSem, endSem);
    const semanasRango = Array.from({ length: realEnd - realStart + 1 }, (_, i) => realStart + i);
    const produccionSemanal: ProduccionSemanalPorFinca[] = semanasRango.map((sem) => ({
      semana: `Sem ${sem}`,
      BABY: cosechasFiltradas
        .filter((c) => c.finca === "BABY" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
      SOLO: cosechasFiltradas
        .filter((c) => c.finca === "SOLO" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
      LAURITA: cosechasFiltradas
        .filter((c) => c.finca === "LAURITA" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
      MARAVILLA: cosechasFiltradas
        .filter((c) => c.finca === "MARAVILLA" && c.semana === sem)
        .reduce((sum, c) => sum + c.cajasProducidas, 0),
    }));

    // Calidad de producción (simulado basado en merma)
    const calidadProduccion: CalidadMensual[] = meses.map((mes, index) => {
      const mesNum = index + 1;
      const cosechasMes = cosechasFiltradas.filter(
        (c) => Math.ceil(c.semana / 4.33) === mesNum
      );
      const mermaPromedio =
        cosechasMes.length > 0
          ? cosechasMes.reduce((sum, c) => sum + c.merma, 0) /
            cosechasMes.length
          : 3;

      // Calcular calidad basada en merma (menos merma = más premium)
      const premium = Math.max(60, 100 - mermaPromedio * 10);
      const rechazo = mermaPromedio;
      const estandar = 100 - premium - rechazo;

      return {
        mes,
        premium: Math.round(premium),
        estandar: Math.round(estandar),
        rechazo: Math.round(rechazo),
      };
    });

    // Rendimiento (basado en ratio)
    const rendimientoData: RendimientoMensual[] = meses.map((mes, index) => {
      const mesNum = index + 1;
      const cosechasMes = cosechasFiltradas.filter(
        (c) => Math.ceil(c.semana / 4.33) === mesNum
      );
      const rendimientoPromedio =
        cosechasMes.length > 0
          ? cosechasMes.reduce((sum, c) => sum + c.ratio, 0) /
            cosechasMes.length
          : 0.9;

      return {
        mes,
        rendimiento: Math.min(1, rendimientoPromedio / 2.5), // Normalizar a 0-1
      };
    });

    // Estadísticas actuales por finca
    const estadisticasFincas: EstadisticasFincas = {
      BABY: {
        cajas: cosechasFiltradas
          .filter((c) => c.finca === "BABY")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        tendencia: "+5.2%",
        positivo: true,
      },
      SOLO: {
        cajas: cosechasFiltradas
          .filter((c) => c.finca === "SOLO")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        tendencia: "-2.1%",
        positivo: false,
      },
      LAURITA: {
        cajas: cosechasFiltradas
          .filter((c) => c.finca === "LAURITA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        tendencia: "+8.3%",
        positivo: true,
      },
      MARAVILLA: {
        cajas: cosechasFiltradas
          .filter((c) => c.finca === "MARAVILLA")
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        tendencia: "+4.7%",
        positivo: true,
      },
    };

    return {
      produccionMensual,
      produccionSemanal,
      calidadProduccion,
      rendimientoData,
      estadisticasFincas,
    };
  }, [
    enfundes,
    cosechas,
    añoSeleccionado,
    periodo,
    semanaInicio,
    semanaFin,
    mesInicio,
    mesFin,
    fincasSeleccionadas,
  ]);

  const currentData = useMemo(() => {
    if (tab === "volumen") {
      return periodo === "mensual" ? produccionMensual : produccionSemanal;
    }
    if (tab === "calidad") {
      return calidadProduccion;
    }
    if (tab === "rendimiento") {
      return rendimientoData;
    }
    // precios
    return preciosMercado;
  }, [tab, periodo, produccionMensual, produccionSemanal, calidadProduccion, rendimientoData, preciosMercado]);

  const currentHeaders = useMemo(() => {
    if (tab === "volumen") {
      return [periodo === "mensual" ? "Mes" : "Semana", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
    }
    if (tab === "calidad") {
      return ["Mes", "Premium", "Estándar", "Rechazo"];
    }
    if (tab === "rendimiento") {
      return ["Mes", "Rendimiento"];
    }
    return ["Mes", "Precio"];
  }, [tab, periodo]);

  const currentKeys = useMemo(() => {
    if (tab === "volumen") {
      return [periodo === "mensual" ? "mes" : "semana", "BABY", "SOLO", "LAURITA", "MARAVILLA"];
    }
    if (tab === "calidad") {
      return ["mes", "premium", "estandar", "rechazo"];
    }
    if (tab === "rendimiento") {
      return ["mes", "rendimiento"];
    }
    return ["mes", "precio"];
  }, [tab, periodo]);

  const currentTitle = useMemo(() => {
    if (tab === "volumen") return `Volumen de Producción (${añoSeleccionado})`;
    if (tab === "calidad") return `Calidad de Producción (${añoSeleccionado})`;
    if (tab === "rendimiento") return `Rendimiento de Producción (${añoSeleccionado})`;
    return `Evolución de Precios de Mercado (${currency}/${unit})`;
  }, [tab, añoSeleccionado, currency, unit]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reportes de Producción
          </h2>
          <p className="text-muted-foreground">
            Análisis detallado de la producción por finca, calidad y rendimiento
          </p>
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

          <Button variant="outline" onClick={() => setPeriodoOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Periodo
          </Button>

          <Button variant="outline" onClick={() => setFiltrosOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>

          <ExportButton
            data={currentData}
            headers={currentHeaders}
            keys={currentKeys}
            title={currentTitle}
            filename="reportes-produccion"
            disabled={tab === "precios" && cargandoPrecios}
          />
        </div>
      </div>

      <Tabs value={tab} className="w-full" onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-[520px]">
          <TabsTrigger value="volumen">Volumen</TabsTrigger>
          <TabsTrigger value="calidad">Calidad</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
          <TabsTrigger value="precios">Precios</TabsTrigger>
        </TabsList>

        <div className="mt-4 mb-6">
          <Tabs value={periodo} className="w-full" onValueChange={setPeriodo}>
            <TabsList className="w-[200px]">
              <TabsTrigger value="semanal">Semanal</TabsTrigger>
              <TabsTrigger value="mensual">Mensual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <TabsContent value="volumen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Volumen de Producción por Finca ({añoSeleccionado})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={
                    periodo === "mensual"
                      ? produccionMensual
                      : produccionSemanal
                  }
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey={periodo === "mensual" ? "mes" : "semana"} stroke="var(--muted-foreground)" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Bar dataKey="BABY" name="Finca BABY" fill="var(--chart-1)" />
                  <Bar dataKey="SOLO" name="Finca SOLO" fill="var(--chart-2)" />
                  <Bar dataKey="LAURITA" name="Finca LAURITA" fill="var(--chart-3)" />
                  <Bar dataKey="MARAVILLA" name="Finca MARAVILLA" fill="var(--chart-4)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(estadisticasFincas).map(([finca, datos]) => (
              <Card key={finca}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Finca {finca}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {datos.cajas.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cajas en {añoSeleccionado}
                  </p>
                  <div
                    className={`text-sm mt-2 ${
                      datos.positivo ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {datos.tendencia} vs año anterior
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calidad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Distribución de Calidad de Producción ({añoSeleccionado})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={calidadProduccion}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Bar dataKey="premium" name="Premium" fill="var(--chart-3)" />
                  <Bar dataKey="estandar" name="Estándar" fill="var(--chart-4)" />
                  <Bar dataKey="rechazo" name="Rechazo" fill="var(--destructive)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(
                    calidadProduccion.reduce(
                      (sum, item) => sum + item.premium,
                      0
                    ) / calidadProduccion.length
                  )}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Promedio {añoSeleccionado}
                </p>
                <div className="text-sm text-green-500 mt-2">
                  +2% vs año anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Estándar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(
                    calidadProduccion.reduce(
                      (sum, item) => sum + item.estandar,
                      0
                    ) / calidadProduccion.length
                  )}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Promedio {añoSeleccionado}
                </p>
                <div className="text-sm text-red-500 mt-2">
                  -2% vs año anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rechazo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(
                    calidadProduccion.reduce(
                      (sum, item) => sum + item.rechazo,
                      0
                    ) / calidadProduccion.length
                  )}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Promedio {añoSeleccionado}
                </p>
                <div className="text-sm text-neutral-500 mt-2">Sin cambios</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Rendimiento de Producción ({añoSeleccionado})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart
                  data={rendimientoData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" />
                  <YAxis domain={[0.8, 1]} />
                  <Tooltip
                    formatter={(value) => [
                      `${(Number(value) * 100).toFixed(1)}%`,
                      "Rendimiento",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rendimiento"
                    name="Rendimiento"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rendimiento Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(
                    rendimientoData[rendimientoData.length - 1]?.rendimiento *
                      100 || 0
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Último mes {añoSeleccionado}
                </p>
                <div className="text-sm text-red-500 mt-2">
                  -2% vs mes anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rendimiento Máximo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(
                    Math.max(...rendimientoData.map((r) => r.rendimiento)) * 100
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Mejor mes {añoSeleccionado}
                </p>
                <div className="text-sm text-green-500 mt-2">
                  +2% vs promedio
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rendimiento Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {(
                    (rendimientoData.reduce(
                      (sum, r) => sum + r.rendimiento,
                      0
                    ) /
                      rendimientoData.length) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Promedio {añoSeleccionado}
                </p>
                <div className="text-sm text-green-500 mt-2">
                  +3% vs año anterior
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="precios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Precios de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              {errorPrecios && (
                <p className="text-sm text-red-500 mb-2">{errorPrecios}</p>
              )}
              {cargandoPrecios ? (
                <p className="text-sm text-muted-foreground">Cargando precios…</p>
              ) : (
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <LineChart data={preciosMercado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="mes" stroke="var(--muted-foreground)" />
                    <YAxis domain={yDomain as any} />
                    <Tooltip
                      formatter={(value) => [
                        `${currencySymbol}${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${unit}`,
                        "Precio",
                      ]}
                      contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="precio" name={`Precio (${currency}/${unit})`} stroke="var(--chart-1)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Precio Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currencySymbol}
                  {precioActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground">Último mes</p>
                <div className={`text-sm mt-2 ${variacionMes >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {variacionMes >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                  {Math.abs(variacionMes).toFixed(1)}% vs mes anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Precio Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currencySymbol}
                  {promedio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground">Periodo seleccionado</p>
                <div className="text-sm text-neutral-500 mt-2">{range} · {market}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Precio Proyectado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currencySymbol}
                  {(precioActual * (1 + (variacionMes || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground">Proyección simple</p>
                <div className="text-sm text-neutral-500 mt-2">Basada en variación mensual</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={periodoOpen} onOpenChange={setPeriodoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar periodo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={periodo} onValueChange={setPeriodo} className="w-full">
              <TabsList className="w-[200px]">
                <TabsTrigger value="semanal">Semanal</TabsTrigger>
                <TabsTrigger value="mensual">Mensual</TabsTrigger>
              </TabsList>
            </Tabs>
            {periodo === "semanal" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Semana inicio</Label>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={semanaInicio}
                      onChange={(e) => {
                        const v = clamp(Number(e.target.value || 1), 1, 52);
                        const end = clamp(Number(semanaFin), 1, 52);
                        setWeekRange([v, end]);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Semana fin</Label>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={semanaFin}
                      onChange={(e) => {
                        const start = clamp(Number(semanaInicio), 1, 52);
                        const v = clamp(Number(e.target.value || 52), 1, 52);
                        setWeekRange([start, v]);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rango semanal</Label>
                  <Slider
                    min={1}
                    max={52}
                    value={[Number(semanaInicio), Number(semanaFin)]}
                    onValueChange={setWeekRange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sem {semanaInicio}</span>
                    <span>Sem {semanaFin}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Mes inicio</Label>
                  <Input value={mesInicio} onChange={(e) => setMesInicio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mes fin</Label>
                  <Input value={mesFin} onChange={(e) => setMesFin(e.target.value)} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Rango precios</Label>
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 meses</SelectItem>
                    <SelectItem value="6m">6 meses</SelectItem>
                    <SelectItem value="12m">12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mercado</Label>
                <Select value={market} onValueChange={setMarket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mercado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EC">Ecuador</SelectItem>
                    <SelectItem value="EU">Unión Europea</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setPeriodoOpen(false)}>Aplicar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={filtrosOpen} onOpenChange={setFiltrosOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Fincas</Label>
            <div className="flex flex-wrap gap-2">
              {["BABY","SOLO","LAURITA","MARAVILLA"].map((f) => (
                <Button key={f} variant={fincasSeleccionadas.includes(f) ? "default" : "outline"} onClick={() => {
                  setFincasSeleccionadas((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])
                }}>
                  {f}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Producto</Label>
                <Select value={commodity} onValueChange={setCommodity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Producto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="plantain">Plátano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setFiltrosOpen(false)}>Aplicar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
