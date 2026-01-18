"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Brain, TrendingUp, AlertCircle, Lightbulb, Package, Users } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

export function AIInsights() {
  const { enfundes, cosechas, empleados, insumos, prestamos } = useApp();
  const router = useRouter();

  // Calcular insights basados en datos reales
  const insights = useMemo(() => {
    const result = [];

    // 1. Análisis de producción por finca
    const produccionPorFinca = cosechas.reduce((acc, c) => {
      const finca = c.fincaNombre || c.finca;
      acc[finca] = (acc[finca] || 0) + c.cajasProducidas;
      return acc;
    }, {} as Record<string, number>);

    const fincaLider = Object.entries(produccionPorFinca)
      .sort(([, a], [, b]) => b - a)[0];
    
    const totalCajas = cosechas.reduce((sum, c) => sum + c.cajasProducidas, 0);
    const totalRacimos = cosechas.reduce((sum, c) => sum + c.racimosCorta, 0);

    if (totalCajas > 0 && fincaLider) {
      result.push({
        type: "success",
        icon: TrendingUp,
        title: "Resumen de Producción",
        description: `Total producido: ${totalCajas.toLocaleString()} cajas de ${totalRacimos.toLocaleString()} racimos. Finca líder: ${fincaLider[0]} con ${fincaLider[1].toLocaleString()} cajas.`,
        action: "Ver Detalles",
        href: "/produccion/cosechas",
      });
    } else if (cosechas.length === 0) {
      result.push({
        type: "info",
        icon: TrendingUp,
        title: "Sin datos de producción",
        description: "No hay registros de cosecha. Comienza registrando la producción de tus fincas.",
        action: "Registrar",
        href: "/produccion/cosechas",
      });
    }

    // 2. Alerta de inventario
    const insumosStockBajo = insumos.filter((i) => i.stockActual < i.stockMinimo);
    const insumosCriticos = insumos.filter((i) => i.stockActual < i.stockMinimo * 0.5);
    
    if (insumosCriticos.length > 0) {
      result.push({
        type: "warning",
        icon: AlertCircle,
        title: "Stock Crítico",
        description: `${insumosCriticos.length} insumo(s) en nivel crítico: ${insumosCriticos.slice(0, 2).map(i => i.nombre).join(", ")}${insumosCriticos.length > 2 ? "..." : ""}. Realizar pedido urgente.`,
        action: "Ver Insumos",
        href: "/inventario/alertas",
      });
    } else if (insumosStockBajo.length > 0) {
      result.push({
        type: "warning",
        icon: Package,
        title: "Alerta de Inventario",
        description: `${insumosStockBajo.length} insumo(s) por debajo del stock mínimo: ${insumosStockBajo.slice(0, 2).map(i => i.nombre).join(", ")}${insumosStockBajo.length > 2 ? "..." : ""}.`,
        action: "Ver Insumos",
        href: "/inventario/alertas",
      });
    }

    // 3. Préstamos activos
    const prestamosActivos = prestamos.filter((p) => p.estado === "activo");
    const totalSaldoPendiente = prestamosActivos.reduce((sum, p) => sum + p.saldoPendiente, 0);
    
    if (prestamosActivos.length > 0) {
      result.push({
        type: "info",
        icon: Users,
        title: "Préstamos Activos",
        description: `${prestamosActivos.length} préstamo(s) activo(s) con saldo pendiente total de $${totalSaldoPendiente.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
        action: "Gestionar",
        href: "/nomina/prestamos",
      });
    }

    // 4. Análisis de enfundes
    const totalEnfundes = enfundes.reduce((sum, e) => sum + e.cantidadEnfundes, 0);
    const totalMatasCaidas = enfundes.reduce((sum, e) => sum + e.matasCaidas, 0);
    const porcentajeMatasCaidas = totalEnfundes > 0 ? (totalMatasCaidas / totalEnfundes * 100) : 0;

    if (totalEnfundes > 0) {
      const promedioEnfundes = Math.round(totalEnfundes / enfundes.length);
      
      if (porcentajeMatasCaidas > 5) {
        result.push({
          type: "warning",
          icon: Lightbulb,
          title: "Matas Caídas Elevadas",
          description: `Se registran ${totalMatasCaidas.toLocaleString()} matas caídas (${porcentajeMatasCaidas.toFixed(1)}% del total). Revisar condiciones del cultivo.`,
          action: "Analizar",
          href: "/produccion/enfundes",
        });
      } else {
        result.push({
          type: "success",
          icon: Brain,
          title: "Análisis de Enfundes",
          description: `Total: ${totalEnfundes.toLocaleString()} enfundes en ${enfundes.length} registros. Promedio: ${promedioEnfundes.toLocaleString()} por registro. Matas caídas: ${porcentajeMatasCaidas.toFixed(1)}%.`,
          action: "Ver Detalles",
          href: "/produccion/enfundes",
        });
      }
    }

    // 5. Ratio promedio de cosechas
    const ratioPromedio = cosechas.length > 0
      ? cosechas.reduce((sum, c) => sum + c.ratio, 0) / cosechas.length
      : 0;
    
    if (ratioPromedio > 0) {
      const ratioOptimo = 2.2; // Ratio óptimo de referencia
      const esOptimo = ratioPromedio >= ratioOptimo;
      
      result.push({
        type: esOptimo ? "success" : "info",
        icon: Brain,
        title: "Eficiencia de Producción",
        description: `Ratio promedio: ${ratioPromedio.toFixed(2)} cajas/racimo. ${esOptimo ? "Excelente rendimiento." : `Meta: ${ratioOptimo}. Oportunidad de mejora.`}`,
        action: "Ver Métricas",
        href: "/reportes",
      });
    }

    // Si no hay insights, mostrar mensaje por defecto
    if (result.length === 0) {
      result.push({
        type: "info",
        icon: Brain,
        title: "Sistema Listo",
        description: "No hay alertas activas. Todos los indicadores están en rangos normales.",
        action: "Ver Dashboard",
        href: "/dashboard",
      });
    }

    return result.slice(0, 4); // Máximo 4 insights
  }, [enfundes, cosechas, insumos, prestamos]);

  const getVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "warning":
        return "destructive";
      case "info":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Insights con IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="rounded-lg border border-border bg-muted/50 p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${getIconColor(insight.type)}`} />
                  <h3 className="font-semibold text-foreground">
                    {insight.title}
                  </h3>
                </div>
                <Badge variant={getVariant(insight.type)}>{insight.type}</Badge>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                {insight.description}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent"
                onClick={() => insight.href && router.push(insight.href)}
              >
                {insight.action}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
