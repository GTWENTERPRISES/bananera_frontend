"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { ExportButton } from "@/src/components/shared/export-button";
import { cn } from "@/src/lib/utils";

export function RecuperacionTable() {
  const { recuperacionCintas } = useApp();

  const avgRecuperacion =
    recuperacionCintas.reduce((sum, r) => sum + r.porcentajeRecuperacion, 0) /
    recuperacionCintas.length;

  const getRecuperacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "text-green-600";
    if (porcentaje >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Recuperación</CardTitle>
        <ExportButton
          onExportExcel={() => {}}
          onExportPDF={() => {}}
          onExportCSV={() => {}}
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Recuperación Promedio</p>
          <p
            className={cn(
              "text-2xl font-bold",
              getRecuperacionColor(avgRecuperacion)
            )}
          >
            {avgRecuperacion.toFixed(1)}%
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finca</TableHead>
                <TableHead>Semana</TableHead>
                <TableHead className="text-right">Iniciales</TableHead>
                <TableHead className="text-right">1ª Cal</TableHead>
                <TableHead className="text-right">2ª Cal</TableHead>
                <TableHead className="text-right">3ª Cal</TableHead>
                <TableHead className="text-right">Barrida</TableHead>
                <TableHead className="text-right">Recuperación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recuperacionCintas.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-medium">{rec.finca}</TableCell>
                  <TableCell>S{rec.semana}</TableCell>
                  <TableCell className="text-right">
                    {rec.enfundesIniciales}
                  </TableCell>
                  <TableCell className="text-right">
                    {rec.primeraCalCosecha}
                  </TableCell>
                  <TableCell className="text-right">
                    {rec.segundaCalCosecha}
                  </TableCell>
                  <TableCell className="text-right">
                    {rec.terceraCalCosecha}
                  </TableCell>
                  <TableCell className="text-right">
                    {rec.barridaFinal}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        rec.porcentajeRecuperacion >= 80
                          ? "default"
                          : "destructive"
                      }
                      className={cn(
                        getRecuperacionColor(rec.porcentajeRecuperacion)
                      )}
                    >
                      {rec.porcentajeRecuperacion.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
