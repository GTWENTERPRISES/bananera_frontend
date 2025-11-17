"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Bell, AlertTriangle, Package, ArrowDownUp, Filter } from "lucide-react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";

export default function AlertasInventarioPage() {
  const [filtro, setFiltro] = useState("todas");
  const isMobile = useIsMobile();
  const { insumos } = useApp();
  const searchParams = useSearchParams();
  const fincaFilter = searchParams.get("finca") || "";
  const router = useRouter();

  const computedAlertas = useMemo(() => {
    const hoy = new Date();
    const dias = (fStr?: string) => {
      if (!fStr) return Infinity;
      const fv = new Date(fStr);
      const diff = Math.ceil((fv.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    };
    return insumos.flatMap((i) => {
      const arr: any[] = [];
      if (i.stockActual < i.stockMinimo) {
        arr.push({
          id: `stock-${i.id}`,
          insumoId: i.id,
          tipo: "stock_bajo",
          producto: i.nombre,
          nivel: i.stockActual < i.stockMinimo * 0.5 ? "crítico" : "advertencia",
          cantidad: i.stockActual,
          minimo: i.stockMinimo,
          fecha: hoy.toISOString().split("T")[0],
          ubicacion: "Bodega",
          finca: i.finca,
        });
      }
      const diasRest = dias(i.fechaVencimiento);
      if (diasRest <= 15) {
        arr.push({
          id: `cad-${i.id}`,
          insumoId: i.id,
          tipo: "caducidad",
          producto: i.nombre,
          nivel: diasRest <= 7 ? "crítico" : "advertencia",
          diasRestantes: diasRest,
          fecha: hoy.toISOString().split("T")[0],
          ubicacion: "Bodega",
          finca: i.finca,
        });
      }
      return arr;
    });
  }, [insumos]);

  const alertasFiltradas = useMemo(() => {
    const base = filtro === "todas" ? computedAlertas : computedAlertas.filter((a: any) => a.tipo === filtro);
    const byFinca = fincaFilter ? base.filter((a: any) => a.finca === fincaFilter) : base;
    return byFinca;
  }, [computedAlertas, filtro, fincaFilter]);

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "crítico":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "advertencia":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "stock_bajo":
        return <Package className="h-4 w-4 mr-1" />;
      case "caducidad":
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return <Bell className="h-4 w-4 mr-1" />;
    }
  };

  const getTipoText = (alerta: any) => {
    switch (alerta.tipo) {
      case "stock_bajo":
        return `Stock bajo: ${alerta.cantidad}/${alerta.minimo} unidades`;
      case "caducidad":
        return `Caducidad: ${alerta.diasRestantes} días restantes`;
      default:
        return "Alerta general";
    }
  };

  return (
    <div className={cn("space-y-4", isMobile && "px-2")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alertas de Inventario</h2>
          <p className="text-muted-foreground">
            Monitorea niveles bajos de stock y productos próximos a caducar
          </p>
          {fincaFilter && (
            <p className="text-xs text-primary mt-1">Filtro contextual por finca: {fincaFilter}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size={isMobile ? "sm" : "default"}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="default" size={isMobile ? "sm" : "default"}>
            <ArrowDownUp className="h-4 w-4 mr-2" />
            Ordenar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todas" className="w-full" onValueChange={setFiltro}>
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="stock_bajo">Stock Bajo</TabsTrigger>
          <TabsTrigger value="caducidad">Caducidad</TabsTrigger>
        </TabsList>

        <TabsContent value={filtro} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertasFiltradas.map((alerta: any) => (
              <Card key={alerta.id} className={cn(
                "border-l-4",
                alerta.nivel === "crítico" ? "border-l-red-500" : "border-l-yellow-500"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{alerta.producto}</CardTitle>
                    <Badge variant="outline" className={getNivelColor(alerta.nivel)}>
                      {alerta.nivel}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    {getTipoIcon(alerta.tipo)}
                    {getTipoText(alerta)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between mb-1">
                      <span>Ubicación:</span>
                      <span className="font-medium">{alerta.ubicacion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span className="font-medium">{alerta.fecha}</span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" className="mr-2">
                      Ignorar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const isStock = alerta.tipo === "stock_bajo";
                        const cantidadSug = isStock
                          ? Math.max((alerta.minimo || 0) - (alerta.cantidad || 0), 0)
                          : "";
                        const tipo = isStock ? "entrada" : "salida";
                        const motivo = isStock
                          ? "Reposición por stock bajo"
                          : "Retiro por caducidad próxima";
                        const qp = new URLSearchParams({
                          insumoId: alerta.insumoId || "",
                          tipo,
                          motivo,
                        } as Record<string, string>);
                        if (cantidadSug) qp.set("cantidad", String(cantidadSug));
                        const finca = alerta.finca || fincaFilter;
                        if (finca) qp.set("finca", finca);
                        router.push(`/inventario/movimientos?${qp.toString()}`);
                      }}
                    >
                      Resolver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {alertasFiltradas.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">No hay alertas</p>
                <p className="text-sm text-muted-foreground text-center">
                  No se encontraron alertas con los filtros seleccionados
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}