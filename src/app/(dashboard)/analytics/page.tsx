"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  AreaChart,
  Area,
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
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Target,
} from "lucide-react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";

// Colores para los gráficos
const COLORS = ["#4f46e5", "#10b981", "#f59e0b"];

// Función simplificada para las etiquetas del gráfico de pie
const renderSimpleLabel = (props: any) => {
  const { name, value } = props;
  return `${name}: ${value}%`;
};

export default function AnalyticsPage() {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 300 : 400;

  // Usar el contexto de la aplicación
  const { cosechas, enfundes, fincas, empleados } = useApp();

  // Calcular métricas basadas en datos reales del contexto
  const calcularMetricas = () => {
    // Producción total (suma de todas las cosechas)
    const produccionTotal = cosechas.reduce(
      (total, cosecha) => total + (cosecha.cajasProducidas || 0),
      0
    );

    // Calcular calidad premium basada en calibración
    const calidadPremium =
      cosechas.length > 0
        ? Math.round(
            cosechas.reduce(
              (sum, cosecha) => sum + (cosecha.calibracion || 0),
              0
            ) / cosechas.length
          )
        : 65;

    // Rendimiento promedio basado en ratio de cosechas
    const rendimientoPromedio =
      cosechas.length > 0
        ? (cosechas.reduce((sum, cosecha) => sum + (cosecha.ratio || 0), 0) /
            cosechas.length) *
          100
        : 0;

    // Precio promedio simulado (en una aplicación real esto vendría de otra fuente)
    const precioPromedio = 6.8;

    return {
      produccionTotal,
      calidadPremium,
      rendimientoPromedio,
      precioPromedio,
    };
  };

  const metricas = calcularMetricas();

  // Generar datos para gráficos basados en datos reales
  const generarDatosGraficos = () => {
    // Producción por semana (usando la semana de la cosecha)
    const produccionPorSemana: { [key: string]: number } = {};
    cosechas.forEach((cosecha) => {
      const clave = `Sem ${cosecha.semana}`;
      produccionPorSemana[clave] =
        (produccionPorSemana[clave] || 0) + (cosecha.cajasProducidas || 0);
    });

    const produccionAnual = Object.entries(produccionPorSemana)
      .map(([semana, produccion]) => ({
        mes: semana,
        produccion,
        proyeccion: Math.round(produccion * 1.1), // Proyección del 10% más
      }))
      .sort((a, b) => {
        // Ordenar por número de semana
        const numA = parseInt(a.mes.replace("Sem ", ""));
        const numB = parseInt(b.mes.replace("Sem ", ""));
        return numA - numB;
      });

    // Rendimiento por finca basado en ratio de cosechas
    const rendimientoFincas = fincas.map((finca) => {
      const cosechasFinca = cosechas.filter(
        (cosecha) => cosecha.finca === finca.nombre
      );

      const rendimientoPromedio =
        cosechasFinca.length > 0
          ? (cosechasFinca.reduce(
              (sum, cosecha) => sum + (cosecha.ratio || 0),
              0
            ) /
              cosechasFinca.length) *
            100
          : 85;

      return {
        name: finca.nombre,
        rendimiento: Math.round(rendimientoPromedio),
        promedio: 85,
      };
    });

    // Distribución de calidad basada en calibración promedio
    const calibracionPromedio =
      cosechas.length > 0
        ? cosechas.reduce(
            (sum, cosecha) => sum + (cosecha.calibracion || 0),
            0
          ) / cosechas.length
        : 46;

    const calidadPremium = Math.min(
      100,
      Math.max(0, (calibracionPromedio / 50) * 100)
    );
    const calidadEstandar = 25;
    const calidadSegunda = Math.max(0, 100 - calidadPremium - calidadEstandar);

    const distribucionCalidad = [
      { name: "Premium", value: Math.round(calidadPremium) },
      { name: "Estándar", value: calidadEstandar },
      { name: "Segunda", value: Math.round(calidadSegunda) },
    ];

    return {
      produccionAnual:
        produccionAnual.length > 0
          ? produccionAnual
          : [
              { mes: "Sem 1", produccion: 1200, proyeccion: 1150 },
              { mes: "Sem 2", produccion: 1300, proyeccion: 1250 },
              { mes: "Sem 3", produccion: 1400, proyeccion: 1350 },
              { mes: "Sem 4", produccion: 1500, proyeccion: 1450 },
              { mes: "Sem 5", produccion: 1600, proyeccion: 1550 },
              { mes: "Sem 6", produccion: 1550, proyeccion: 1600 },
            ],
      rendimientoFincas:
        rendimientoFincas.length > 0
          ? rendimientoFincas
          : [
              { name: "BABY", rendimiento: 95, promedio: 85 },
              { name: "SOLO", rendimiento: 88, promedio: 85 },
              { name: "LAURITA", rendimiento: 92, promedio: 85 },
              { name: "MARAVILLA", rendimiento: 79, promedio: 85 },
            ],
      distribucionCalidad,
    };
  };

  const datosGraficos = generarDatosGraficos();

  // Función para exportar datos
  const handleExport = () => {
    const data = {
      metricas,
      datosGraficos,
      timestamp: new Date().toISOString(),
      resumen: {
        totalCosechas: cosechas.length,
        totalEnfundes: enfundes.length,
        totalFincas: fincas.length,
        totalEmpleados: empleados.length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", isMobile && "px-2")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Análisis avanzado de datos y métricas clave del negocio
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="2025">
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size={isMobile ? "sm" : "default"}>
            <Calendar className="h-4 w-4 mr-2" />
            Periodo
          </Button>

          <Button
            variant="default"
            size={isMobile ? "sm" : "default"}
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Producción Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
              <div className="text-3xl font-bold">
                {metricas.produccionTotal.toLocaleString()}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Cajas (Acumulado 2025)
            </p>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +7.2% vs año anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calidad Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PieChartIcon className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-3xl font-bold">
                {metricas.calidadPremium}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Promedio 2025</p>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3.5% vs año anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rendimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-purple-600 mr-2" />
              <div className="text-3xl font-bold">
                {metricas.rendimientoPromedio.toFixed(1)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Eficiencia operativa
            </p>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +1.8% vs año anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Precio Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Target className="h-5 w-5 text-amber-600 mr-2" />
              <div className="text-3xl font-bold">
                ${metricas.precioPromedio.toFixed(2)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Por caja</p>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +5.2% vs año anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="produccion" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="produccion">Producción</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
          <TabsTrigger value="calidad">Calidad</TabsTrigger>
        </TabsList>

        <TabsContent value="produccion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Producción Semanal</CardTitle>
              <CardDescription>
                Comparativa entre producción real y proyectada por semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart
                  data={datosGraficos.produccionAnual}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toLocaleString()} cajas`,
                      "",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="produccion"
                    name="Producción Real"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="proyeccion"
                    name="Proyección"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rendimiento" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Finca</CardTitle>
              <CardDescription>
                Comparativa de rendimiento vs promedio general
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={datosGraficos.rendimientoFincas}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  <Legend />
                  <Bar
                    dataKey="rendimiento"
                    name="Rendimiento"
                    fill="#4f46e5"
                  />
                  <Bar
                    dataKey="promedio"
                    name="Promedio General"
                    fill="#d1d5db"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calidad" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calidad</CardTitle>
              <CardDescription>
                Análisis de la calidad de producción basado en calibración
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center">
              <ResponsiveContainer
                width={isMobile ? "100%" : "60%"}
                height={chartHeight}
              >
                <PieChart>
                  <Pie
                    data={datosGraficos.distribucionCalidad}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 100 : 150}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderSimpleLabel}
                  >
                    {datosGraficos.distribucionCalidad.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div
                className={cn("mt-4 md:mt-0", isMobile ? "w-full" : "w-2/5")}
              >
                <h3 className="text-lg font-medium mb-4">
                  Análisis de Calidad
                </h3>
                <div className="space-y-4">
                  {datosGraficos.distribucionCalidad.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
