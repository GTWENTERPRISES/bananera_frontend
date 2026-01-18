"use client";

import { useMemo } from "react";
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

interface ComparativaFincasProps {
  año?: string;
  periodo?: string;
}

export function ComparativaFincas({ año = "2025", periodo = "mensual" }: ComparativaFincasProps) {
  const { enfundes, cosechas, fincas: fincasData } = useApp();

  // Helper para obtener nombre de finca desde UUID
  const getFincaNombre = (fincaId: string, fincaNombre?: string): string => {
    if (fincaNombre && fincaNombre !== 'Sin asignar') return fincaNombre;
    const f = fincasData.find(f => f.id === fincaId || f.nombre === fincaId);
    return f?.nombre || fincaId;
  };

  // Filtrar por año
  const enfundesFiltradosAño = useMemo(() => 
    enfundes.filter(e => e.año.toString() === año), [enfundes, año]);
  const cosechasFiltradasAño = useMemo(() => 
    cosechas.filter(c => c.año.toString() === año), [cosechas, año]);

  // Filtrar según periodo
  const { enfundesFiltrados, cosechasFiltradas } = useMemo(() => {
    if (periodo === "semanal") {
      // Últimas 4 semanas disponibles
      const semanasUnicas = [...new Set(cosechasFiltradasAño.map(c => c.semana))].sort((a, b) => b - a).slice(0, 4);
      const semanasEnfundes = [...new Set(enfundesFiltradosAño.map(e => e.semana))].sort((a, b) => b - a).slice(0, 4);
      return {
        cosechasFiltradas: cosechasFiltradasAño.filter(c => semanasUnicas.includes(c.semana)),
        enfundesFiltrados: enfundesFiltradosAño.filter(e => semanasEnfundes.includes(e.semana))
      };
    }
    // Mensual y Anual usan todos los datos del año
    return { cosechasFiltradas: cosechasFiltradasAño, enfundesFiltrados: enfundesFiltradosAño };
  }, [cosechasFiltradasAño, enfundesFiltradosAño, periodo]);

  // Título dinámico
  const tituloComparativa = periodo === "semanal" ? "Comparativa de Fincas (Últimas 4 semanas)" : 
                            periodo === "mensual" ? `Comparativa de Fincas (${año})` : 
                            `Comparativa de Fincas - Total ${año}`;

  const fincas = ["BABY", "SOLO", "LAURITA", "MARAVILLA"] as const;

  const stats = fincas.map((finca) => {
    const enfundesFinca = enfundesFiltrados.filter((e) => getFincaNombre(e.finca, e.fincaNombre) === finca);
    const cosechasFinca = cosechasFiltradas.filter((c) => getFincaNombre(c.finca, c.fincaNombre) === finca);

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
        <CardTitle>{tituloComparativa}</CardTitle>
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
