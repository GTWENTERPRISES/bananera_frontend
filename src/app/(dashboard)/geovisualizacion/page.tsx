"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
// import { MapGeneral } from "@/src/components/geo/map-general";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
const MapGeneral = dynamic(
  () => import("@/src/components/geo/map-general").then((m) => m.MapGeneral),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[320px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    ),
  }
);
import { useApp } from "@/src/contexts/app-context";
import { useState, useMemo } from "react";
import { exportData } from "@/src/lib/export-utils";
import { fincasGeoJSON } from "@/src/lib/geo/fincas.geojson";

// Error boundary para capturar errores de render del mapa y evitar pantalla en blanco
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Error en Geovisualización:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm text-destructive">
          Ocurrió un error al cargar el mapa. Intente recargar la página.
        </div>
      );
    }
    return this.props.children;
  }
}

// Placeholder dinámico para componentes futuros (detalle y reportes), evitando SSR de Leaflet
const FincaDetail = dynamic(() => Promise.resolve(() => <div className="p-4 text-sm text-muted-foreground">Próximamente: Detalle por finca con capas (fenología, rutas, densidad).</div>), { ssr: false });
const GeoReports = dynamic(() => Promise.resolve(() => <div className="p-4 text-sm text-muted-foreground">Próximamente: Reportes geoespaciales (cosechas por zona, alertas geolocalizadas).</div>), { ssr: false });

export default function GeovisualizacionPage() {
  const { fincas, cosechas } = useApp();
  const [selectedFinca, setSelectedFinca] = useState<string>(fincas[0]?.nombre ?? "BABY");

  const fincaOptions = useMemo(() => fincas.map((f) => f.nombre), [fincas]);

  const handleExportGeoJSON = async () => {
    const collection = fincasGeoJSON;
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: "application/geo+json" });
    const FileSaver = await import("file-saver");
    FileSaver.saveAs(blob, "fincas.geojson");
  };

  const handleExportExcel = async () => {
    const headers = ["Finca", "Hectáreas", "Cajas (última semana)", "Cajas/ha (semana)"];
    const latestByFinca = new Map<string, number>();
    for (const c of cosechas) {
      const prev = latestByFinca.get(c.finca) ?? 0;
      latestByFinca.set(c.finca, Math.max(prev, c.cajasProducidas));
    }
    const data = fincas
      .filter((f) => !!f.geom)
      .map((f) => {
        const cajas = latestByFinca.get(f.nombre) ?? 0;
        const rendimiento = f.hectareas ? cajas / f.hectareas : 0;
        return [f.nombre, f.hectareas, cajas, rendimiento];
      });
    await exportData("excel", data, headers, "Rendimiento por Finca");
  };

  const handleExportPDF = async () => {
    const headers = ["Finca", "Hectáreas", "Cajas (última semana)", "Cajas/ha (semana)"];
    const latestByFinca = new Map<string, number>();
    for (const c of cosechas) {
      const prev = latestByFinca.get(c.finca) ?? 0;
      latestByFinca.set(c.finca, Math.max(prev, c.cajasProducidas));
    }
    const data = fincas
      .filter((f) => !!f.geom)
      .map((f) => {
        const cajas = latestByFinca.get(f.nombre) ?? 0;
        const rendimiento = f.hectareas ? cajas / f.hectareas : 0;
        return [f.nombre, f.hectareas.toFixed(2), cajas.toLocaleString(), rendimiento.toFixed(2)];
      });
    await exportData("pdf", data, headers, "Rendimiento por Finca");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Mapa General de Fincas</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              <MapGeneral />
            </ErrorBoundary>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border bg-background/80 p-3 text-xs">
              <div className="font-semibold mb-1">Rendimiento (cajas/ha)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#1a5e20' }}></span><span>&ge; 45</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#2e7d32' }}></span><span>35 - 44.9</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#fbc02d' }}></span><span>25 - 34.9</span></div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#e53935' }}></span><span>&lt; 25</span></div>
              <div className="mt-2 border-t pt-2">
                <div className="font-semibold mb-1">Cuadrillas</div>
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#1976d2' }}></span><span>Activas</span></div>
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#9e9e9e' }}></span><span>Sin actividad</span></div>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="font-semibold mb-1">Inventario</div>
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#d32f2f' }}></span><span>Stock bajo</span></div>
                <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#2e7d32' }}></span><span>Stock OK</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Finca</label>
              <Select value={selectedFinca} onValueChange={setSelectedFinca}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione finca" />
                </SelectTrigger>
                <SelectContent>
                  {fincaOptions.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleExportGeoJSON}>
                Exportar GeoJSON
              </Button>
              <Button variant="outline" onClick={handleExportExcel}>
                Exportar Excel
              </Button>
              <Button onClick={handleExportPDF}>Exportar PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detalle" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detalle">Detalle por Finca</TabsTrigger>
          <TabsTrigger value="reportes">Reportes Geoespaciales</TabsTrigger>
        </TabsList>
        <TabsContent value="detalle">
          <FincaDetail />
        </TabsContent>
        <TabsContent value="reportes">
          <GeoReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}