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
import { Badge } from "@/src/components/ui/badge";
import { ExportButton } from "@/src/components/shared/export-button";
import { AlertTriangle, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context"; // Corregida la importación
import type { Insumo } from "@/src/lib/types";
import { useState } from "react";
import { Input } from "@/src/components/ui/input";

export function InsumosTable() {
  const { insumos } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInsumos = insumos.filter(
    (insumo) =>
      insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) // Cambiado de codigo a proveedor
  );

  const totalValor = filteredInsumos.reduce(
    (sum, i) => sum + i.stockActual * i.precioUnitario,
    0
  );
  const stockBajo = filteredInsumos.filter(
    (i) => i.stockActual < i.stockMinimo
  ).length;
  const stockCritico = filteredInsumos.filter(
    (i) => i.stockActual < i.stockMinimo * 0.5
  ).length;

  const getStockStatus = (insumo: Insumo) => {
    const porcentaje = (insumo.stockActual / insumo.stockMinimo) * 100;
    if (porcentaje < 50)
      return {
        label: "Crítico",
        color: "text-red-600",
        variant: "destructive" as const,
      };
    if (porcentaje < 100)
      return {
        label: "Bajo",
        color: "text-yellow-600",
        variant: "secondary" as const,
      };
    return {
      label: "Normal",
      color: "text-green-600",
      variant: "default" as const,
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de Insumos</CardTitle>
        <ExportButton
          data={filteredInsumos}
          headers={[
            "Nombre",
            "Categoría",
            "Stock Actual",
            "Stock Mínimo",
            "Stock Máximo",
            "Precio Unitario",
            "Proveedor",
            "Estado",
          ]} // Actualizados los headers
          keys={[
            "nombre",
            "categoria",
            "stockActual",
            "stockMinimo",
            "stockMaximo",
            "precioUnitario",
            "proveedor",
            "estado",
          ]}
          title="Inventario de Insumos"
          filename="inventario-insumos"
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total Insumos</p>
            <p className="text-2xl font-bold text-foreground">
              {insumos.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-foreground">
              $
              {totalValor.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Stock Bajo</p>
            <p className="text-2xl font-bold text-yellow-600">{stockBajo}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Stock Crítico</p>
            <p className="text-2xl font-bold text-red-600">{stockCritico}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, categoría o proveedor..."
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
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">Stock Mínimo</TableHead>
                <TableHead className="text-right">Stock Máximo</TableHead>{" "}
                {/* Nueva columna */}
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.map((insumo) => {
                // Cambiado de insumos a filteredInsumos
                const status = getStockStatus(insumo);
                const valorTotal = insumo.stockActual * insumo.precioUnitario;
                return (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {insumo.stockActual < insumo.stockMinimo && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        {insumo.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {insumo.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(status.color)}>
                        {insumo.stockActual} {insumo.unidadMedida}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {insumo.stockMinimo} {insumo.unidadMedida}
                    </TableCell>
                    <TableCell className="text-right">
                      {" "}
                      {/* Nueva columna */}
                      {insumo.stockMaximo} {insumo.unidadMedida}
                    </TableCell>
                    <TableCell className="text-right">
                      ${insumo.precioUnitario.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${valorTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>{insumo.proveedor}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
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
