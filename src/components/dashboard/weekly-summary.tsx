"use client";

import { cn } from "@/src/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Calendar, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

export function WeeklySummary() {
  const { enfundes, cosechas } = useApp();

  const totalEnfundes = enfundes.reduce(
    (sum, e) => sum + e.cantidadEnfundes,
    0
  );
  const totalCosecha = cosechas.reduce((sum, c) => sum + c.cajasProducidas, 0);
  const avgRatio =
    cosechas.reduce((sum, c) => sum + c.ratio, 0) / cosechas.length;
  const totalMatasCaidas = enfundes.reduce((sum, e) => sum + e.matasCaidas, 0);

  const stats = [
    {
      label: "Enfundes Realizados",
      value: totalEnfundes.toLocaleString(),
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Cajas Producidas",
      value: totalCosecha.toLocaleString(),
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Ratio Promedio",
      value: avgRatio.toFixed(2),
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      label: "Matas Caídas",
      value: totalMatasCaidas.toString(),
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen Semana Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-lg border border-border p-4"
              >
                <div className={cn("rounded-full bg-muted p-2", stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
