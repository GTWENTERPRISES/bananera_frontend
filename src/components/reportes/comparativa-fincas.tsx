"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ComparativaFincas() {
  const { enfundes, cosechas } = useApp();

  const fincas = ["BABY", "SOLO", "LAURITA", "MARAVILLA"] as const;

  const stats = fincas.map((finca) => {
    const enfundesFinca = enfundes.filter((e) => e.finca === finca);
    const cosechasFinca = cosechas.filter((c) => c.finca === finca);

    // Usar las propiedades correctas
    const totalEnfundes = enfundesFinca.reduce(
      (sum, e) => sum + e.cantidadEnfundes,
      0
    );
    const totalCosechas = cosechasFinca.reduce(
      (sum, c) => sum + c.cajasProducidas,
      0
    );

    // Calcular eficiencia basada en relación cajas/enfundes
    const eficiencia =
      totalEnfundes > 0 ? (totalCosechas / totalEnfundes) * 100 : 0;

    return {
      finca,
      enfundes: totalEnfundes,
      cosechas: totalCosechas,
      eficiencia,
      tendencia: Math.random() > 0.5 ? "up" : "down",
      cambio: (Math.random() * 20 - 10).toFixed(1),
    };
  });

  const maxEnfundes = Math.max(...stats.map((s) => s.enfundes));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa de Fincas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.finca} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{stat.finca}</h3>
                <Badge
                  variant={stat.tendencia === "up" ? "default" : "secondary"}
                  className="gap-1"
                >
                  {stat.tendencia === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.cambio}%
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Eficiencia</p>
                <p className="text-lg font-bold text-foreground">
                  {stat.eficiencia.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Enfundes</p>
                <p className="font-medium text-foreground">
                  {stat.enfundes.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cajas Producidas</p>
                <p className="font-medium text-foreground">
                  {stat.cosechas.toLocaleString()}
                </p>
              </div>
            </div>

            <Progress
              value={(stat.enfundes / maxEnfundes) * 100}
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
