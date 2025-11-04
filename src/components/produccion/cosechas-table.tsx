"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { ExportButton } from "@/src/components/shared/export-button";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { Edit, Search, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function CosechasTable() {
  const { cosechas, fincas } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  // Función para obtener información de la finca
  const getFincaInfo = (fincaName: string) => {
    return fincas.find((f) => f.nombre === fincaName);
  };

  const filteredCosechas = cosechas.filter(
    (cosecha) =>
      cosecha.finca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFincaInfo(cosecha.finca)
        ?.responsable.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const totalCajas = filteredCosechas.reduce(
    (sum, c) => sum + c.cajasProducidas,
    0
  );
  const avgRatio =
    filteredCosechas.length > 0
      ? filteredCosechas.reduce((sum, c) => sum + c.ratio, 0) /
        filteredCosechas.length
      : 0;
  const avgMerma =
    filteredCosechas.length > 0
      ? filteredCosechas.reduce((sum, c) => sum + c.merma, 0) /
        filteredCosechas.length
      : 0;

  const getMermaColor = (merma: number) => {
    if (merma < 3) return "text-green-600";
    if (merma < 4) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Cosechas</CardTitle>
        <ExportButton
          data={filteredCosechas}
          headers={[
            "Semana",
            "Año",
            "Finca",
            "Racimos Cortados",
            "Racimos Rechazados",
            "Racimos Recuperados",
            "Cajas Producidas",
            "Peso Promedio",
            "Calibración",
            "Número de Manos",
            "Ratio",
            "Merma",
          ]}
          title="Registro de Cosechas"
          filename="registro-cosechas.xlsx"
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total Cajas</p>
            <p className="text-2xl font-bold text-foreground">
              {totalCajas.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Ratio Promedio</p>
            <p className="text-2xl font-bold text-foreground">
              {avgRatio.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Merma Promedio</p>
            <p className={cn("text-2xl font-bold", getMermaColor(avgMerma))}>
              {avgMerma.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por finca o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Finca</TableHead>
                <TableHead>Racimos Cortados</TableHead>
                <TableHead>Racimos Rechazados</TableHead>
                <TableHead>Racimos Recuperados</TableHead>
                <TableHead>Cajas</TableHead>
                <TableHead>Peso Prom.</TableHead>
                <TableHead>Calib.</TableHead>
                <TableHead>Manos</TableHead>
                <TableHead>Ratio</TableHead>
                <TableHead>Merma</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCosechas.map((cosecha) => {
                const fincaInfo = getFincaInfo(cosecha.finca);
                return (
                  <TableRow key={cosecha.id}>
                    <TableCell>{cosecha.semana}</TableCell>
                    <TableCell>{cosecha.año}</TableCell>
                    <TableCell>{cosecha.finca}</TableCell>
                    <TableCell>
                      {cosecha.racimosCorta.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {cosecha.racimosRechazados.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {cosecha.racimosRecuperados.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {cosecha.cajasProducidas.toLocaleString()}
                    </TableCell>
                    <TableCell>{cosecha.pesoPromedio.toFixed(1)} lb</TableCell>
                    <TableCell>{cosecha.calibracion}</TableCell>
                    <TableCell>{cosecha.numeroManos.toFixed(1)}</TableCell>
                    <TableCell>{cosecha.ratio.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={getMermaColor(cosecha.merma)}>
                        {cosecha.merma.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {fincaInfo?.responsable || "No asignado"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
