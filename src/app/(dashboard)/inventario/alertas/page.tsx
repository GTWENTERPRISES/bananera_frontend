"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";
import { Bell, AlertTriangle, Package, ArrowDownUp, Filter } from "lucide-react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";

export default function AlertasInventarioPage() {
  const [filtro, setFiltro] = useState("todas");
  const isMobile = useIsMobile();
  const { insumos, alertas, currentUser, fincas } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const fincaFilter = searchParams.get("finca") || "";
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedFinca, setSelectedFinca] = useState<string>(fincaFilter);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [sortMode, setSortMode] = useState<"critico" | "fecha">("critico");
  const [page, setPage] = useState(1);

  const computedAlertas = useMemo(() => {
    const inventarioAlertas = (alertas || []).filter((a) => a.modulo.toLowerCase() === "inventario");
    return inventarioAlertas.map((a) => {
      const meta = a.metadata || {};
      const tipoMeta = meta.tipo || (a.titulo.toLowerCase().includes("stock") ? "stock_bajo" : "caducidad");
      const nivel = a.tipo === "critico" ? "crítico" : a.tipo === "advertencia" ? "advertencia" : "info";
      const producto = meta.producto || a.descripcion.split(" - ")[0] || "";
      const fecha = new Date(a.fecha).toISOString().split("T")[0];
      return {
        id: a.id,
        insumoId: meta.insumoId,
        tipo: tipoMeta,
        producto,
        nivel,
        cantidad: meta.cantidad ? Number(meta.cantidad) : undefined,
        minimo: meta.minimo ? Number(meta.minimo) : undefined,
        diasRestantes: meta.diasRestantes ? Number(meta.diasRestantes) : undefined,
        fecha,
        ubicacion: "Bodega",
        finca: a.finca,
        unidadMedida: meta.unidadMedida,
      } as any;
    });
  }, [alertas]);

  const alertasFiltradas = useMemo(() => {
    let list = filtro === "todas" ? computedAlertas : computedAlertas.filter((a: any) => a.tipo === filtro);
    if (fincaFilter) list = list.filter((a: any) => a.finca === fincaFilter);
    if (criticalOnly) list = list.filter((a: any) => a.nivel === "crítico");
    list = [...list].sort((a: any, b: any) => {
      if (sortMode === "critico") {
        const va = a.nivel === "crítico" ? 0 : 1;
        const vb = b.nivel === "crítico" ? 0 : 1;
        return va - vb;
      }
      // fecha descendente
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
    return list;
  }, [computedAlertas, filtro, fincaFilter, criticalOnly, sortMode]);

  const total = alertasFiltradas.length;
  const pageSize = isMobile ? 6 : total || 1;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const visibles = alertasFiltradas.slice(startIdx, endIdx);

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
        return alerta.cantidad != null && alerta.minimo != null
          ? `Stock bajo: ${alerta.cantidad}/${alerta.minimo} unidades`
          : "Stock bajo";
      case "caducidad":
        return alerta.diasRestantes != null
          ? `Caducidad: ${alerta.diasRestantes} días restantes`
          : "Caducidad próxima";
      default:
        return "Alerta general";
    }
  };

  const shouldConfirm = (alerta: any) => {
    const isCritico = alerta.nivel === "crítico";
    const role = currentUser?.rol;
    return isCritico && (role === "supervisor_finca" || role === "bodeguero");
  };

  return (
    <div className={cn("responsive-container space-y-4 md:space-y-6", isMobile && "px-2")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Alertas de Inventario</h2>
            {(currentUser?.rol === 'supervisor_finca' || currentUser?.rol === 'bodeguero') && currentUser?.fincaAsignada && (
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {fincas.find(f => f.id === currentUser.fincaAsignada)?.nombre || currentUser.fincaAsignada}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Monitorea niveles bajos de stock y productos próximos a caducar
          </p>
          {fincaFilter && (
            <p className="text-xs text-primary mt-1">Filtro contextual por finca: {fincaFilter}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          
          <Button variant="default" size={isMobile ? "sm" : "default"} onClick={() => setSortMode(sortMode === "critico" ? "fecha" : "critico")}>
            <ArrowDownUp className="h-4 w-4 mr-2" />
            {sortMode === "critico" ? "Crítico primero" : "Fecha reciente"}
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
            {visibles.map((alerta: any) => (
              <Card key={alerta.id} className={cn(
                "border-l-4",
                alerta.nivel === "crítico" ? "border-l-red-500" : "border-l-yellow-500"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base md:text-lg truncate max-w-[180px]">{alerta.producto}</CardTitle>
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
                          insumoId: alerta.insumoId || (insumos.find((i) => i.nombre === alerta.producto)?.id || ""),
                          tipo,
                          motivo,
                        } as Record<string, string>);
                        if (cantidadSug) qp.set("cantidad", String(cantidadSug));
                        const finca = alerta.finca || fincaFilter;
                        if (finca) qp.set("finca", finca);
                        const href = `/inventario/movimientos?${qp.toString()}`;
                        if (shouldConfirm(alerta)) {
                          setPendingHref(href);
                          setConfirmOpen(true);
                        } else {
                          router.push(href);
                        }
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
          {isMobile && pageCount > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}</p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => Math.max(1, p - 1)); }} />
                  </PaginationItem>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" disabled={page >= pageCount} onClick={(e) => { e.preventDefault(); if (page < pageCount) setPage((p) => Math.min(pageCount, p + 1)); }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar acción</AlertDialogTitle>
              <AlertDialogDescription>
                Vas a registrar un movimiento crítico de inventario. Confirma para continuar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingHref) router.push(pendingHref);
                  setConfirmOpen(false);
                  setPendingHref(null);
                }}
              >
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}