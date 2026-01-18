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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";

export function MovimientosTable() {
  const { getFilteredMovimientos, getFilteredInsumos } = useApp();
  const movimientosInventario = getFilteredMovimientos();
  const insumos = getFilteredInsumos();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const entradas = movimientosInventario.filter(
    (m) => m.tipo === "entrada"
  ).length;
  const salidas = movimientosInventario.filter(
    (m) => m.tipo === "salida"
  ).length;

  // Función para obtener el nombre del insumo
  const getInsumoNombre = (mov: MovimientoInventario) => {
    // Primero intentar usar el nombre que viene del backend
    if (mov.insumoNombre) return mov.insumoNombre;
    // Fallback: buscar en la lista de insumos
    const insumo = insumos.find((i) => i.id === mov.insumoId);
    return insumo?.nombre || "Insumo no encontrado";
  };

  // Función para obtener la unidad de medida del insumo
  const getInsumoUnidad = (insumoId: string) => {
    const insumo = insumos.find((i) => i.id === insumoId);
    return insumo?.unidadMedida || "";
  };

  const filteredMovimientos = movimientosInventario.filter((mov) => {
    const term = searchTerm.toLowerCase();
    const nombre = (getInsumoNombre(mov) || "").toLowerCase();
    const tipo = (mov.tipo || "").toLowerCase();
    const responsable = (mov.responsable || "").toLowerCase();
    const motivo = (mov.motivo || "").toLowerCase();
    return (
      nombre.includes(term) ||
      tipo.includes(term) ||
      responsable.includes(term) ||
      motivo.includes(term)
    );
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = filteredMovimientos.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const sorted = (() => {
    const data = [...filteredMovimientos];
    return data.sort((a, b) => {
      const av = new Date(a.fecha).getTime();
      const bv = new Date(b.fecha).getTime();
      return sortDir === "asc" ? av - bv : bv - av;
    });
  })();
  const paginated = sorted.slice(startIdx, endIdx);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Movimientos</CardTitle>
        <ExportButton
          data={filteredMovimientos.map((mov) => ({
            fecha: mov.fecha,
            insumo: getInsumoNombre(mov),
            tipo: mov.tipo,
            cantidad: mov.cantidad,
            unidad: getInsumoUnidad(mov.insumoId),
            responsable: mov.responsable,
            motivo: mov.motivo,
          }))}
          headers={[
            "Fecha",
            "Insumo",
            "Tipo",
            "Cantidad",
            "Unidad",
            "Responsable",
            "Motivo",
          ]}
          keys={[
            "fecha",
            "insumo",
            "tipo",
            "cantidad",
            "unidad",
            "responsable",
            "motivo",
          ]}
          title="Historial de Movimientos"
          filename="movimientos-inventario"
          enableFilter
          dateField="fecha"
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

        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por insumo, tipo, responsable o motivo..."
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
            <span className="ml-4 text-sm text-muted-foreground">Orden</span>
            <Select value={sortDir} onValueChange={(v) => { setSortDir(v as any); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Más recientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Más recientes</SelectItem>
                <SelectItem value="asc">Más antiguos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay movimientos que coincidan con tu búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[540px] rounded-md border border-border responsive-table px-1">
            <Table className="text-sm table-auto md:table-fixed min-w-[950px]">
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-xs md:text-sm">
              <TableRow>
                <TableHead className="truncate max-w-[160px]">Insumo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="truncate max-w-[160px]">Responsable</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((mov) => (
                <TableRow key={mov.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                  <TableCell className="font-medium truncate max-w-[160px]">
                    {getInsumoNombre(mov)}
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
                  <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                    {mov.cantidad} {getInsumoUnidad(mov.insumoId)}
                  </TableCell>
                  <TableCell className="truncate max-w-[160px]">{mov.responsableNombre || mov.responsable || "No asignado"}</TableCell>
                  <TableCell className="max-w-xs truncate" title={mov.motivo}>
                    {mov.motivo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
        )}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" disabled={page >= pageCount} onClick={(e) => { e.preventDefault(); if (page < pageCount) setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
