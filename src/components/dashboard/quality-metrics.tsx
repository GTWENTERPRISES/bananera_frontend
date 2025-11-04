"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Progress } from "@/src/components/ui/progress";

export function QualityMetrics() {
  const { cosechas } = useApp();

  const avgPeso =
    cosechas.reduce((sum, c) => sum + c.pesoPromedio, 0) / cosechas.length;
  const avgCalibracion =
    cosechas.reduce((sum, c) => sum + c.calibracion, 0) / cosechas.length;
  const avgManos =
    cosechas.reduce((sum, c) => sum + c.numeroManos, 0) / cosechas.length;
  const avgRatio =
    cosechas.reduce((sum, c) => sum + c.ratio, 0) / cosechas.length;

  const metrics = [
    {
      label: "Peso Promedio",
      value: avgPeso.toFixed(1),
      unit: "lb",
      target: 43,
      current: avgPeso,
    },
    {
      label: "Calibración",
      value: avgCalibracion.toFixed(1),
      unit: "",
      target: 47,
      current: avgCalibracion,
    },
    {
      label: "Número de Manos",
      value: avgManos.toFixed(1),
      unit: "",
      target: 10,
      current: avgManos,
    },
    {
      label: "Ratio",
      value: avgRatio.toFixed(2),
      unit: "",
      target: 2.3,
      current: avgRatio,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Calidad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const percentage = (metric.current / metric.target) * 100;
          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {metric.label}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {metric.value} {metric.unit}
                </span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Meta: {metric.target} {metric.unit} ({percentage.toFixed(0)}%)
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
