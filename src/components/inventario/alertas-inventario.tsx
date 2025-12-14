"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";

export function AlertasInventario() {
  const { insumos, generarOrdenCompra } = useApp();
  const { toast } = useToast();

  const insumosEnRiesgo = insumos.filter((i) => i.stockActual < i.stockMinimo);
  const insumosAlerta = insumosEnRiesgo.filter((i) => !i.pedidoGenerado);
  const insumosCriticos = insumosAlerta.filter(
    (i) => i.stockActual < i.stockMinimo * 0.5
  );
  const insumosConOrden = insumosEnRiesgo.filter((i) => i.pedidoGenerado);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Alertas de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insumosEnRiesgo.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay alertas de inventario
            </p>
          </div>
        ) : (
          <>
            {insumosCriticos.length > 0 && (
              <div className="rounded-lg border border-red-600 bg-red-50 p-4 dark:bg-red-950/20">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Stock Crítico ({insumosCriticos.length})
                </div>
                <div className="space-y-2">
                  {insumosCriticos.map((insumo) => (
                    <div
                      key={insumo.id}
                      className="flex items-center justify-between rounded border border-red-200 bg-white p-2 dark:bg-red-950/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {insumo.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {insumo.stockActual} {insumo.unidadMedida} /
                          Mínimo: {insumo.stockMinimo} {insumo.unidadMedida}
                        </p>
                      </div>
                      <Badge variant="destructive">Crítico</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insumosAlerta.filter((i) => i.stockActual >= i.stockMinimo * 0.5)
              .length > 0 && (
              <div className="rounded-lg border border-yellow-600 bg-yellow-50 p-4 dark:bg-yellow-950/20">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Stock Bajo (
                  {
                    insumosAlerta.filter(
                      (i) => i.stockActual >= i.stockMinimo * 0.5
                    ).length
                  }
                  )
                </div>
                <div className="space-y-2">
                  {insumosAlerta
                    .filter((i) => i.stockActual >= i.stockMinimo * 0.5)
                    .map((insumo) => (
                      <div
                        key={insumo.id}
                        className="flex items-center justify-between rounded border border-yellow-200 bg-white p-2 dark:bg-yellow-950/10"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {insumo.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {insumo.stockActual} {insumo.unidadMedida} /
                            Mínimo: {insumo.stockMinimo} {insumo.unidadMedida}
                          </p>
                        </div>
                        <Badge variant="secondary">Bajo</Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {insumosConOrden.length > 0 && (
              <div className="rounded-lg border border-blue-600 bg-blue-50 p-4 dark:bg-blue-950/20">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                  <AlertTriangle className="h-4 w-4" />
                  Pedidos Generados ({insumosConOrden.length})
                </div>
                <div className="space-y-2">
                  {insumosConOrden.map((insumo) => (
                    <div
                      key={insumo.id}
                      className="flex items-center justify-between rounded border border-blue-200 bg-white p-2 dark:bg-blue-950/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
