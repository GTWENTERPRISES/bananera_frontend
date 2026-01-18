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
  const { getFilteredInsumos } = useApp();
  const insumos = getFilteredInsumos();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
  const sorted = (() => {
    const data = [...filteredInsumos];
    if (!sortBy) return data;
    return data.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre) * dir;
        case "categoria":
          return a.categoria.localeCompare(b.categoria) * dir;
        case "stockActual":
          return (a.stockActual - b.stockActual) * dir;
        case "fechaVencimiento": {
          const av = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : 0;
          const bv = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : 0;
          return (av - bv) * dir;
        }
        default:
          return 0;
      }
    });
  })();
  const paginated = sorted.slice(startIdx, endIdx);

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
            "Vencimiento",
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
            "fechaVencimiento",
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

        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
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
            <span className="ml-4 text-sm text-muted-foreground">Ordenar</span>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v === "none" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sin orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin orden</SelectItem>
                <SelectItem value="nombre">Nombre</SelectItem>
                <SelectItem value="categoria">Categoría</SelectItem>
                <SelectItem value="stockActual">Stock</SelectItem>
                <SelectItem value="fechaVencimiento">Vencimiento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(v) => { setSortDir(v as any); setPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Desc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay insumos que coincidan con tu búsqueda.
          </div>
        ) : (
          <div key={`${searchTerm}-${pageSize}-${page}`} className="overflow-x-auto overflow-y-auto max-h-[540px] animate-in fade-in duration-200 rounded-md border border-border responsive-table px-1">
            <Table className="text-sm table-auto md:table-fixed min-w-[1000px]">
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-xs md:text-sm">
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
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="animate-in fade-in duration-200">
                {paginated.map((insumo) => {
                  // Cambiado de insumos a filteredInsumos
                  const status = getStockStatus(insumo);
                  const valorTotal = insumo.stockActual * insumo.precioUnitario;
                  return (
                  <TableRow key={insumo.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                    <TableCell className="font-medium truncate max-w-[180px]">
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
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      <span className={cn(status.color)}>
                        {insumo.stockActual} {insumo.unidadMedida}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {insumo.stockMinimo} {insumo.unidadMedida}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {/* Nueva columna */}
                      {insumo.stockMaximo} {insumo.unidadMedida}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      ${insumo.precioUnitario.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                      ${valorTotal.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="truncate max-w-[160px]">{insumo.proveedor}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {insumo.fechaVencimiento
                        ? new Date(insumo.fechaVencimiento).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" size="default" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} size="icon" onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" size="default" disabled={page >= pageCount} onClick={(e) => { e.preventDefault(); if (page < pageCount) setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
