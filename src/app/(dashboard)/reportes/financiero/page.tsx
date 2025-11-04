"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from "recharts";
import { Download, Filter, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";


// Datos de ejemplo para los gráficos
const ingresosMensuales = [
  { mes: "Ene", ingresos: 45000, costos: 32000, beneficio: 13000 },
  { mes: "Feb", ingresos: 48000, costos: 33000, beneficio: 15000 },
  { mes: "Mar", ingresos: 52000, costos: 35000, beneficio: 17000 },
  { mes: "Abr", ingresos: 55000, costos: 36000, beneficio: 19000 },
  { mes: "May", ingresos: 59000, costos: 38000, beneficio: 21000 },
  { mes: "Jun", ingresos: 62000, costos: 40000, beneficio: 22000 },
];

const distribucionCostos = [
  { name: "Mano de Obra", value: 40 },
  { name: "Insumos", value: 25 },
  { name: "Logística", value: 15 },
  { name: "Administración", value: 12 },
  { name: "Otros", value: 8 },
];

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const preciosMercado = [
  { mes: "Ene", precio: 6.2 },
  { mes: "Feb", precio: 6.5 },
  { mes: "Mar", precio: 6.8 },
  { mes: "Abr", precio: 7.0 },
  { mes: "May", precio: 7.2 },
  { mes: "Jun", precio: 7.1 },
];

// Función simple para labels del PieChart
const renderSimpleLabel = ({
  percent,
  name
}: PieLabelRenderProps) => {
  if (typeof percent !== 'number') return null;
  
  return `${name} ${(percent * 100).toFixed(0)}%`;
};

export default function ReportesFinancieroPage() {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 300 : 400;
  const { state } = useApp();
  
  return (
    <div className={cn("space-y-6", isMobile && "px-2")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes Financieros</h2>
          <p className="text-muted-foreground">
            Análisis de ingresos, costos y rentabilidad del negocio
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="2023">
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size={isMobile ? "sm" : "default"}>
            <Calendar className="h-4 w-4 mr-2" />
            Periodo
          </Button>
          
          <Button variant="outline" size={isMobile ? "sm" : "default"}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="default" size={isMobile ? "sm" : "default"}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-3xl font-bold">$321,000</div>
            </div>
            <p className="text-sm text-muted-foreground">Acumulado 2023</p>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8.5% vs año anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Costos Operativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-3xl font-bold">$214,000</div>
            </div>
            <p className="text-sm text-muted-foreground">Acumulado 2023</p>
            <div className="text-sm text-red-500 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +5.2% vs año anterior
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Margen de Beneficio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">33.3%</div>
            <p className="text-sm text-muted-foreground">Promedio 2023</p>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.1% vs año anterior
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="ingresos" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="ingresos">Ingresos/Costos</TabsTrigger>
          <TabsTrigger value="distribucion">Distribución</TabsTrigger>
          <TabsTrigger value="precios">Precios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ingresos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos, Costos y Beneficios</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <AreaChart
                  data={ingresosMensuales}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="costos" name="Costos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="beneficio" name="Beneficio" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribucion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Costos Operativos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center">
              <ResponsiveContainer width={isMobile ? "100%" : "60%"} height={chartHeight}>
                <PieChart>
                  <Pie
                    data={distribucionCostos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 100 : 150}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderSimpleLabel} 
                  >
                    {distribucionCostos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className={cn("mt-4 md:mt-0", isMobile ? "w-full" : "w-2/5")}>
                <h3 className="text-lg font-medium mb-4">Desglose de Costos</h3>
                <div className="space-y-4">
                  {distribucionCostos.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
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
        
        <TabsContent value="precios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Precios de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart
                  data={preciosMercado}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[5, 8]} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Precio por caja']} />
                  <Legend />
                  <Line type="monotone" dataKey="precio" name="Precio por caja" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Precio Actual</div>
                  <div className="text-2xl font-bold">$7.10</div>
                  <div className="text-sm text-red-500 mt-1 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -1.4% vs mes anterior
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Precio Promedio</div>
                  <div className="text-2xl font-bold">$6.80</div>
                  <div className="text-sm text-green-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2% vs año anterior
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Precio Proyectado</div>
                  <div className="text-2xl font-bold">$7.30</div>
                  <div className="text-sm text-green-500 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.8% próximo trimestre
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}