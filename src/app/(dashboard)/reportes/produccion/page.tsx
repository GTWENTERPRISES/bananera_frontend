"use client";

import { useState, useMemo } from "react";
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
import { Download, Filter, Calendar } from "lucide-react";
import { useApp } from "@/src/contexts/app-context";

export default function ReportesProduccionPage() {
  const { enfundes, cosechas } = useApp();
  const [periodo, setPeriodo] = useState("mensual");
  const [añoSeleccionado, setAñoSeleccionado] = useState("2025");

  // Altura fija para los gráficos
  const chartHeight = 400;

  // Procesar datos reales del contexto
  const {
    produccionMensual,
    produccionSemanal,
    calidadProduccion,
    rendimientoData,
    estadisticasFincas,
  } = useMemo(() => {
    // Filtrar datos por año seleccionado
    const enfundesFiltrados = enfundes.filter(
      (e) => e.año.toString() === añoSeleccionado
    );
    const cosechasFiltradas = cosechas.filter(
      (c) => c.año.toString() === añoSeleccionado
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
    const produccionMensual = meses.map((mes, index) => {
      const mesNum = index + 1;
      return {
        mes,
        BABY: cosechasFiltradas
          .filter(
            (c) => c.finca === "BABY" && Math.ceil(c.semana / 4.33) === mesNum
          )
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        SOLO: cosechasFiltradas
          .filter(
            (c) => c.finca === "SOLO" && Math.ceil(c.semana / 4.33) === mesNum
          )
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        LAURITA: cosechasFiltradas
          .filter(
            (c) =>
              c.finca === "LAURITA" && Math.ceil(c.semana / 4.33) === mesNum
          )
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        MARAVILLA: cosechasFiltradas
          .filter(
            (c) =>
              c.finca === "MARAVILLA" && Math.ceil(c.semana / 4.33) === mesNum
          )
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      };
    });

    // Producción semanal (últimas 4 semanas)
    const produccionSemanal = Array.from({ length: 4 }, (_, i) => {
      const semanaNum = i + 1;
      return {
        semana: `Sem ${semanaNum}`,
        BABY: cosechasFiltradas
          .filter((c) => c.finca === "BABY" && c.semana === semanaNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        SOLO: cosechasFiltradas
          .filter((c) => c.finca === "SOLO" && c.semana === semanaNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        LAURITA: cosechasFiltradas
          .filter((c) => c.finca === "LAURITA" && c.semana === semanaNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
        MARAVILLA: cosechasFiltradas
          .filter((c) => c.finca === "MARAVILLA" && c.semana === semanaNum)
          .reduce((sum, c) => sum + c.cajasProducidas, 0),
      };
    });

    // Calidad de producción (simulado basado en merma)
    const calidadProduccion = meses.map((mes, index) => {
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
    const rendimientoData = meses.map((mes, index) => {
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
    const estadisticasFincas = {
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
  }, [enfundes, cosechas, añoSeleccionado]);

  // Función para exportar reportes
  const handleExport = () => {
    // Aquí iría la lógica para exportar los reportes
    console.log("Exportando reportes...");
  };

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

          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Periodo
          </Button>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>

          <Button variant="default" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="volumen" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="volumen">Volumen</TabsTrigger>
          <TabsTrigger value="calidad">Calidad</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={periodo === "mensual" ? "mes" : "semana"} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="BABY" name="Finca BABY" fill="#4f46e5" />
                  <Bar dataKey="SOLO" name="Finca SOLO" fill="#06b6d4" />
                  <Bar dataKey="LAURITA" name="Finca LAURITA" fill="#10b981" />
                  <Bar
                    dataKey="MARAVILLA"
                    name="Finca MARAVILLA"
                    fill="#f59e0b"
                  />
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="premium" name="Premium" fill="#10b981" />
                  <Bar dataKey="estandar" name="Estándar" fill="#f59e0b" />
                  <Bar dataKey="rechazo" name="Rechazo" fill="#ef4444" />
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
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
                    stroke="#4f46e5"
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
      </Tabs>
    </div>
  );
}
