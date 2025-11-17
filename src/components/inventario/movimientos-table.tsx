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
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

export function MovimientosTable() {
  const { movimientosInventario, insumos } = useApp(); // Agregué insumos
  const [searchTerm, setSearchTerm] = useState("");

  const entradas = movimientosInventario.filter(
    (m) => m.tipo === "entrada"
  ).length;
  const salidas = movimientosInventario.filter(
    (m) => m.tipo === "salida"
  ).length;

  // Función para obtener el nombre del insumo
  const getInsumoNombre = (insumoId: string) => {
    const insumo = insumos.find((i) => i.id === insumoId);
    return insumo?.nombre || "Insumo no encontrado";
  };

  // Función para obtener la unidad de medida del insumo
  const getInsumoUnidad = (insumoId: string) => {
    const insumo = insumos.find((i) => i.id === insumoId);
    return insumo?.unidadMedida || "";
  };

  const filteredMovimientos = movimientosInventario.filter(
    (mov) =>
      getInsumoNombre(mov.insumoId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      mov.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Movimientos</CardTitle>
        <ExportButton
          data={filteredMovimientos.map((mov) => ({
            Fecha: new Date(mov.fecha).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            Insumo: getInsumoNombre(mov.insumoId),
            Tipo: mov.tipo === "entrada" ? "Entrada" : "Salida",
            Cantidad: `${mov.cantidad} ${getInsumoUnidad(mov.insumoId)}`,
            Responsable: mov.responsable,
            Motivo: mov.motivo,
          }))}
          headers={[
            "Fecha",
            "Insumo",
            "Tipo",
            "Cantidad",
            "Responsable",
            "Motivo",
          ]}
          keys={[
            "Fecha",
            "Insumo",
            "Tipo",
            "Cantidad",
            "Responsable",
            "Motivo",
          ]}
          title="Historial de Movimientos"
          filename="movimientos-inventario"
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total Movimientos</p>
            <p className="text-2xl font-bold text-foreground">
              {movimientosInventario.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Entradas</p>
            <p className="text-2xl font-bold text-green-600">{entradas}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Salidas</p>
            <p className="text-2xl font-bold text-red-600">{salidas}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por insumo, tipo, responsable o motivo..."
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
                <TableHead>Insumo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovimientos.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="font-medium">
                    {getInsumoNombre(mov.insumoId)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={mov.tipo === "entrada" ? "default" : "secondary"}
                      className={
                        mov.tipo === "entrada"
                          ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                      }
                    >
                      <div className="flex items-center gap-1">
                        {mov.tipo === "entrada" ? (
                          <ArrowDownCircle className="h-3 w-3" />
                        ) : (
                          <ArrowUpCircle className="h-3 w-3" />
                        )}
                        {mov.tipo === "entrada" ? "Entrada" : "Salida"}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {mov.cantidad} {getInsumoUnidad(mov.insumoId)}
                  </TableCell>
                  <TableCell>{mov.responsable}</TableCell>
                  <TableCell className="max-w-xs truncate" title={mov.motivo}>
                    {mov.motivo}
                  </TableCell>
                  <TableCell>
                    {new Date(mov.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
