"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
// import { MapGeneral } from "@/src/components/geo/map-general";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
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
import type { Finca } from "@/src/lib/types";

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

function FincaDetailInner({ selectedFinca }: { selectedFinca: string }) {
  const { fincas, cosechas, empleados, enfundes } = useApp();
  const finca = fincas.find((f) => f.nombre === selectedFinca);

  const cosechasFinca = useMemo(() =>
    cosechas.filter((c) => c.finca === selectedFinca).sort((a, b) => b.año - a.año || b.semana - a.semana),
  [cosechas, selectedFinca]);

  const resumen = useMemo(() => {
    const cajasTotal = cosechasFinca.reduce((s, c) => s + c.cajasProducidas, 0);
    const rendimientoSemanal = (() => {
      const ultima = cosechasFinca[0];
      if (!ultima || !finca?.hectareas) return 0;
      return ultima.cajasProducidas / finca.hectareas;
    })();
    const ratioPromedio = cosechasFinca.length ? cosechasFinca.reduce((s, c) => s + c.ratio, 0) / cosechasFinca.length : 0;
    const mermaPromedio = cosechasFinca.length ? cosechasFinca.reduce((s, c) => s + c.merma, 0) / cosechasFinca.length : 0;
    const calibracionPromedio = cosechasFinca.length ? cosechasFinca.reduce((s, c) => s + c.calibracion, 0) / cosechasFinca.length : 0;
    const cuadrillasActivas = empleados.filter((e) => e.activo && e.labor === "Enfunde" && e.finca === selectedFinca).length;
    const enfundesSemana = enfundes.filter((e) => e.finca === selectedFinca).reduce((s, e) => s + e.cantidadEnfundes, 0);
    return { cajasTotal, rendimientoSemanal, ratioPromedio, mermaPromedio, calibracionPromedio, cuadrillasActivas, enfundesSemana };
  }, [cosechasFinca, empleados, enfundes, finca, selectedFinca]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Detalle de {selectedFinca}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Hectáreas</p>
              <p className="text-lg font-semibold">{finca?.hectareas ?? "-"}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Variedad</p>
              <p className="text-lg font-semibold">{finca?.variedad ?? "-"}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Responsable</p>
              <p className="text-lg font-semibold">{finca?.responsable ?? "-"}</p>
            </div>
            <div className={cn("rounded-lg border bg-muted/40 p-3", "md:col-span-1")}> 
              <p className="text-xs text-muted-foreground">Cuadrillas activas</p>
              <p className="text-lg font-semibold">{resumen.cuadrillasActivas}</p>
            </div>
            <div className={cn("rounded-lg border bg-muted/40 p-3", "md:col-span-1")}>
              <p className="text-xs text-muted-foreground">Enfundes (acumulado)</p>
              <p className="text-lg font-semibold">{resumen.enfundesSemana.toLocaleString()}</p>
            </div>
            <div className={cn("rounded-lg border bg-muted/40 p-3", "md:col-span-1")}>
              <p className="text-xs text-muted-foreground">Rendimiento semanal (cajas/ha)</p>
              <p className="text-lg font-semibold">{resumen.rendimientoSemanal.toFixed(1)}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm text-muted-foreground">Últimas cosechas</div>
            <div className="w-full overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Semana</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Cajas</TableHead>
                    <TableHead>Ratio</TableHead>
                    <TableHead>Merma</TableHead>
                    <TableHead>Calibración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cosechasFinca.slice(0, 8).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.semana}</TableCell>
                      <TableCell>{c.año}</TableCell>
                      <TableCell>{c.cajasProducidas.toLocaleString()}</TableCell>
                      <TableCell>{c.ratio.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={c.merma < 3.5 ? "default" : "destructive"}>{c.merma.toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell>{c.calibracion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GeoReportsInner() {
  const { fincas, cosechas, empleados, insumos } = useApp();
  const latestByFinca = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cosechas) {
      m.set(c.finca, Math.max(m.get(c.finca) ?? 0, c.cajasProducidas));
    }
    return m;
  }, [cosechas]);

  const datos = useMemo(() => {
    return fincas.filter((f) => !!f.geom).map((f) => {
      const cajas = latestByFinca.get(f.nombre) ?? 0;
      const rendimiento = f.hectareas ? cajas / f.hectareas : 0;
      const cuadrillas = empleados.filter((e) => e.activo && e.labor === "Enfunde" && e.finca === f.nombre).length;
      const stockBajo = insumos.filter((i) => i.finca === f.nombre && i.stockActual < i.stockMinimo).length;
      return { finca: f.nombre, hectareas: f.hectareas, cajas, rendimiento, cuadrillas, stockBajo };
    });
  }, [fincas, latestByFinca, empleados, insumos]);

  const top = [...datos].sort((a, b) => b.rendimiento - a.rendimiento).slice(0, 3);
  const low = [...datos].sort((a, b) => a.rendimiento - b.rendimiento).slice(0, 3);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Finca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Finca</TableHead>
                  <TableHead>Hectáreas</TableHead>
                  <TableHead>Cajas (última semana)</TableHead>
                  <TableHead>Cajas/ha</TableHead>
                  <TableHead>Cuadrillas</TableHead>
                  <TableHead>Insumos en alerta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((d) => (
                  <TableRow key={d.finca}>
                    <TableCell>{d.finca}</TableCell>
                    <TableCell>{d.hectareas}</TableCell>
                    <TableCell>{d.cajas.toLocaleString()}</TableCell>
                    <TableCell>{d.rendimiento.toFixed(2)}</TableCell>
                    <TableCell>{d.cuadrillas}</TableCell>
                    <TableCell>
                      <Badge variant={d.stockBajo > 0 ? "destructive" : "default"}>{d.stockBajo}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:grid-cols-2 mt-4">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium mb-2">Top rendimiento</p>
              {top.map((t) => (
                <div key={t.finca} className="flex items-center justify-between text-sm">
                  <span>{t.finca}</span>
                  <span className="font-semibold">{t.rendimiento.toFixed(2)} cajas/ha</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium mb-2">Rendimiento más bajo</p>
              {low.map((t) => (
                <div key={t.finca} className="flex items-center justify-between text-sm">
                  <span>{t.finca}</span>
                  <span className="font-semibold">{t.rendimiento.toFixed(2)} cajas/ha</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const FincaDetail = dynamic(() => Promise.resolve(FincaDetailInner), { ssr: false });
const GeoReports = dynamic(() => Promise.resolve(GeoReportsInner), { ssr: false });

export default function GeovisualizacionPage() {
  const { fincas, cosechas } = useApp();
  const [selectedFinca, setSelectedFinca] = useState<string>(fincas[0]?.nombre ?? "BABY");

  const fincaOptions = useMemo(() => fincas.map((f) => f.nombre), [fincas]);

  const toFeatureCollection = (items: Finca[]) => {
    const features = items
      .filter((f) => !!f.geom)
      .map((f) => ({
        type: "Feature",
        geometry: f.geom as any,
        properties: {
          id: f.id,
          nombre: f.nombre,
          hectareas: f.hectareas,
          variedad: f.variedad,
          responsable: f.responsable,
        },
      }));
    return {
      type: "FeatureCollection",
      features,
    } as const;
  };

  const handleExportGeoJSON = async () => {
    const collection = toFeatureCollection(fincas);
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
                <MapGeneral selectedFinca={selectedFinca} />
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
          <FincaDetail selectedFinca={selectedFinca} />
        </TabsContent>
        <TabsContent value="reportes">
          <GeoReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}