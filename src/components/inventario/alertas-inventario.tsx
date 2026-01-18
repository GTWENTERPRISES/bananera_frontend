"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";

export function AlertasInventario() {
  const { getFilteredInsumos, generarOrdenCompra, currentUser } = useApp();
  const insumos = getFilteredInsumos();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [confirmOpen, setConfirmOpen] = useState(false as any);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const insumosEnRiesgo = insumos.filter((i) => i.stockActual < i.stockMinimo);
  const insumosAlerta = insumosEnRiesgo.filter((i) => !i.pedidoGenerado);
  const insumosCriticos = insumosAlerta.filter(
    (i) => i.stockActual < i.stockMinimo * 0.5
  );
  const insumosConOrden = insumosEnRiesgo.filter((i) => i.pedidoGenerado);

  const totalCriticos = insumosCriticos.length;
  const totalBajos = insumosAlerta.filter((i) => i.stockActual >= i.stockMinimo * 0.5).length;
  const totalPedidos = insumosConOrden.length;

  const shouldConfirm = (critico: boolean) => {
    const role = currentUser?.rol;
    return critico && (role === "supervisor_finca" || role === "bodeguero");
  };

  return (
    <Card className="lg:sticky lg:top-24 lg:max-h-[75vh] lg:overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Alertas de Inventario
          </div>
          <div className="flex items-center gap-2">
            {totalCriticos > 0 && (
              <Badge variant="destructive">{totalCriticos} crítico(s)</Badge>
            )}
            {totalBajos > 0 && (
              <Badge variant="secondary">{totalBajos} bajo(s)</Badge>
            )}
            {totalPedidos > 0 && (
              <Badge variant="outline">{totalPedidos} pedido(s)</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insumosEnRiesgo.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay alertas de inventario
            </p>
          </div>
        ) : (
          <Collapsible defaultOpen={!isMobile}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Resumen de alertas</p>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "default"} className="bg-transparent">
                  {isMobile ? "Mostrar" : "Ocultar"}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
            {insumosCriticos.length > 0 && (
              <div className="rounded-lg border border-red-600 bg-red-50 p-3 dark:bg-red-950/20">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Stock Crítico ({insumosCriticos.length})
                </div>
                <div className="space-y-1">
                  {insumosCriticos.map((insumo) => (
                    <button
                      key={insumo.id}
                      className="flex items-center justify-between rounded border border-red-200 bg-white p-2 dark:bg-red-950/10 hover:bg-red-50"
                      onClick={() => {
                        const cantidadSug = Math.max(insumo.stockMinimo - insumo.stockActual, 0);
                        const qp = new URLSearchParams({
                          insumoId: insumo.id,
                          tipo: "entrada",
                          motivo: "Reposición por stock crítico",
                        } as Record<string, string>);
                        if (cantidadSug) qp.set("cantidad", String(cantidadSug));
                        const href = `/inventario/movimientos?${qp.toString()}`;
                        if (shouldConfirm(true)) {
                          setPendingHref(href);
                          setConfirmOpen(true);
                        } else {
                          router.push(href);
                        }
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                          {insumo.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {insumo.stockActual} {insumo.unidadMedida} /
                          Mínimo: {insumo.stockMinimo} {insumo.unidadMedida}
                        </p>
                      </div>
                      <Badge variant="destructive">Crítico</Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {insumosAlerta.filter((i) => i.stockActual >= i.stockMinimo * 0.5)
              .length > 0 && (
              <div className="rounded-lg border border-yellow-600 bg-yellow-50 p-3 dark:bg-yellow-950/20">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Stock Bajo (
                  {
                    insumosAlerta.filter(
                      (i) => i.stockActual >= i.stockMinimo * 0.5
                    ).length
                  }
                  )
                </div>
                <div className="space-y-1">
                  {insumosAlerta
                    .filter((i) => i.stockActual >= i.stockMinimo * 0.5)
                    .map((insumo) => (
                      <button
                        key={insumo.id}
                        className="flex items-center justify-between rounded border border-yellow-200 bg-white p-2 dark:bg-yellow-950/10 hover:bg-yellow-50"
                        onClick={() => {
                          const cantidadSug = Math.max(insumo.stockMinimo - insumo.stockActual, 0);
                          const qp = new URLSearchParams({
                            insumoId: insumo.id,
                            tipo: "entrada",
                            motivo: "Reposición por stock bajo",
                          } as Record<string, string>);
                          if (cantidadSug) qp.set("cantidad", String(cantidadSug));
                          const href = `/inventario/movimientos?${qp.toString()}`;
                          if (shouldConfirm(false)) {
                            setPendingHref(href);
                            setConfirmOpen(true);
                          } else {
                            router.push(href);
                          }
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                            {insumo.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {insumo.stockActual} {insumo.unidadMedida} /
                            Mínimo: {insumo.stockMinimo} {insumo.unidadMedida}
                          </p>
                        </div>
                        <Badge variant="secondary">Bajo</Badge>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {insumosConOrden.length > 0 && (
              <div className="rounded-lg border border-blue-600 bg-blue-50 p-3 dark:bg-blue-950/20">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-600">
                  <AlertTriangle className="h-4 w-4" />
                  Pedidos Generados ({insumosConOrden.length})
                </div>
                <div className="space-y-1">
                  {insumosConOrden.map((insumo) => (
                    <div
                      key={insumo.id}
                      className="flex items-center justify-between rounded border border-blue-200 bg-white p-2 dark:bg-blue-950/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                          {insumo.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {insumo.stockActual} {insumo.unidadMedida} /
                          Mínimo: {insumo.stockMinimo} {insumo.unidadMedida}
                        </p>
                      </div>
                      <Badge variant="outline">Orden generada</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                insumosAlerta.forEach((i) => generarOrdenCompra(i.id));
                toast({
                  title: "Orden de Compra",
                  description: `Generada para ${insumosAlerta.length} insumo(s)`,
                });
              }}
              disabled={insumosAlerta.length === 0}
            >
              Generar Orden de Compra
            </Button>
            </CollapsibleContent>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar acción</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vas a registrar un movimiento de inventario. Confirma para continuar.
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
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
