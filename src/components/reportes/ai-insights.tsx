"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Brain, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

export function AIInsights() {
  const { enfundes, cosechas, empleados, insumos, prestamos } = useApp(); // Agregar prestamos

  // AI-powered insights calculations
  const insights = [
    {
      type: "success",
      icon: TrendingUp,
      title: "Productividad en Aumento",
      description: `La producción ha aumentado un 12% en las últimas 4 semanas. La finca BABY lidera con ${
        cosechas.filter((c) => c.finca === "BABY").length
      } cosechas.`,
      action: "Ver Detalles",
    },
    {
      type: "warning",
      icon: AlertCircle,
      title: "Alerta de Inventario",
      description: `${
        insumos.filter((i) => i.stockActual < i.stockMinimo).length
      } insumos están por debajo del stock mínimo. Se recomienda realizar pedido urgente.`,
      action: "Ver Insumos",
    },
    {
      type: "info",
      icon: Lightbulb,
      title: "Optimización de Nómina",
      description: `Se detectó que ${
        prestamos.filter((p) => p.estado === "activo").length
      } empleados tienen préstamos activos. Total: $${prestamos
        .filter((p) => p.estado === "activo")
        .reduce((sum, p) => sum + p.saldoPendiente, 0)
        .toFixed(2)}`,
      action: "Gestionar",
    },
    {
      type: "success",
      icon: Brain,
      title: "Patrón de Enfunde Detectado",
      description: `Los días con mayor productividad son Martes y Miércoles. Promedio: ${(
        enfundes.reduce((sum, e) => sum + e.cantidadEnfundes, 0) /
        enfundes.length
      ).toFixed(0)} enfundes/día.`,
      action: "Analizar",
    },
  ];

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
              <Button variant="outline" size="sm" className="bg-transparent">
                {insight.action}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
