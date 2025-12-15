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

  const filteredMovimientos = movimientosInventario.filter((mov) => {
    const term = searchTerm.toLowerCase();
    const nombre = (getInsumoNombre(mov.insumoId) || "").toLowerCase();
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
  const paginated = filteredMovimientos.slice(startIdx, endIdx);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Movimientos</CardTitle>
        <ExportButton
          data={filteredMovimientos.map((mov) => ({
            fecha: mov.fecha,
            insumo: getInsumoNombre(mov.insumoId),
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
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((mov) => (
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
