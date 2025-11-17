"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Info, TrendingUp, Package } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

export function AIAlerts() {
  const { alertas, fincas, currentUser, marcarAlertaLeida } = useApp();
  const router = useRouter();
  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return undefined;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada);
    return f?.nombre;
  })();

  const alertasVisibles = (alertas || []).filter((a) => {
    if (!currentUser) return false;
    const rolPermitido = a.rolesPermitidos?.includes(currentUser.rol);
    const aplicaFinca = currentUser.rol === "supervisor_finca";
    const fincaOk = !aplicaFinca || !a.finca || a.finca === fincaAsignadaNombre;
    return rolPermitido && fincaOk;
  });

  const getAlertHref = (a: { modulo: string; finca?: string; titulo?: string }) => {
    let base = "/dashboard";
    if (a.modulo === "Inventario") base = "/inventario/alertas";
    else if (a.modulo === "Producción") {
      const t = a.titulo?.toLowerCase() || "";
      base = t.includes("recuperación") ? "/produccion/recuperacion" : "/produccion/cosechas";
    }
    else if (a.modulo === "Nómina") {
      const t = a.titulo?.toLowerCase() || "";
      base = t.includes("roles de pago") ? "/nomina/roles" : "/nomina/empleados";
    }
    else if (a.modulo === "Analytics") base = "/analytics/predictivo";
    else if (a.modulo === "Seguridad") base = "/configuracion/permisos";
    else if (a.modulo === "Sistema") base = "/dashboard";
    const qp = a.finca ? `?finca=${encodeURIComponent(a.finca)}` : "";
    return `${base}${qp}`;
  };

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
        {alertasVisibles.slice(0, 5).map((alerta) => {
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
                <Button
                  variant="link"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    const href = getAlertHref(alerta);
                    router.push(href);
                  }}
                >
                  Ver detalle
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
