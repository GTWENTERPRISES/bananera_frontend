"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Info, TrendingUp, Package } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

export function AIAlerts() {
  const { alertas, marcarAlertaLeida } = useApp();

  const getIcon = (modulo: string) => {
    switch (modulo) {
      case "Inventario":
        return Package;
      case "Producción":
        return TrendingUp;
      default:
        return Info;
    }
  };

  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return "text-red-600";
      case "advertencia":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas del Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertas.slice(0, 5).map((alerta) => {
          const Icon = getIcon(alerta.modulo);
          return (
            <div
              key={alerta.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                alerta.leida ? "bg-muted/50" : "bg-card"
              )}
            >
              <div className={cn("mt-0.5", getIconColor(alerta.tipo))}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {alerta.titulo}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(alerta.fecha).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alerta.descripcion}
                </p>
                {alerta.accionRequerida && (
                  <p className="text-xs font-medium text-primary">
                    Acción: {alerta.accionRequerida}
                  </p>
                )}
                {!alerta.leida && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => marcarAlertaLeida(alerta.id)}
                  >
                    Marcar como leída
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
