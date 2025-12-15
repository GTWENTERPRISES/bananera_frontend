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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";

export function InsumosTable() {
  const { insumos } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInsumos = insumos.filter(
    (insumo) =>
      insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) // Cambiado de codigo a proveedor
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = filteredInsumos.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const paginated = filteredInsumos.slice(startIdx, endIdx);

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
          enableFilter
          dateField="fechaVencimiento"
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ver</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[90px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">por página</span>
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
                <TableHead className="text-right">Stock Máximo</TableHead>
                {/* Nueva columna */}
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((insumo) => {
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
                        {insumo.pedidoGenerado && (
                          <Badge variant="outline" className="text-xs">Orden generada</Badge>
                        )}
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" size="default" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} size="icon" onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" size="default" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
