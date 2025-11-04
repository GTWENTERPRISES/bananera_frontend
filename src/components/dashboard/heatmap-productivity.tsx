"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

export function HeatmapProductivity() {
  const fincas = ["BABY", "SOLO", "LAURITA", "MARAVILLA"];
  const lotes = ["A", "B", "C", "D", "E"];

  // Mock productivity data (0-100)
  const productivityData: Record<string, Record<string, number>> = {
    BABY: { A: 92, B: 88, C: 95, D: 85, E: 90 },
    SOLO: { A: 78, B: 82, C: 75, D: 88, E: 80 },
    LAURITA: { A: 85, B: 90, C: 87, D: 92, E: 89 },
    MARAVILLA: { A: 94, B: 96, C: 93, D: 98, E: 95 },
  };

  const getColorClass = (value: number) => {
    if (value >= 90) return "bg-green-600";
    if (value >= 80) return "bg-green-500";
    if (value >= 70) return "bg-yellow-500";
    if (value >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor - Productividad por Lotes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            <div className="text-xs font-medium text-muted-foreground"></div>
            {lotes.map((lote) => (
              <div
                key={lote}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                Lote {lote}
              </div>
            ))}
          </div>

          {fincas.map((finca) => (
            <div key={finca} className="grid grid-cols-6 gap-2">
              <div className="flex items-center text-xs font-medium text-foreground">
                {finca}
              </div>
              {lotes.map((lote) => {
                const value = productivityData[finca][lote];
                return (
                  <div
                    key={`${finca}-${lote}`}
                    className={cn(
                      "flex h-12 items-center justify-center rounded text-xs font-bold text-white",
                      getColorClass(value)
                    )}
                  >
                    {value}%
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-500"></div>
              <span className="text-xs text-muted-foreground">&lt;60%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-orange-500"></div>
              <span className="text-xs text-muted-foreground">60-70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-yellow-500"></div>
              <span className="text-xs text-muted-foreground">70-80%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-500"></div>
              <span className="text-xs text-muted-foreground">80-90%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-600"></div>
              <span className="text-xs text-muted-foreground">&gt;90%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
