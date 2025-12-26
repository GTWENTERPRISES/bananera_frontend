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
import { Button } from "@/src/components/ui/button";
import { ExportButton } from "@/src/components/shared/export-button";
import { DollarSign } from "lucide-react";
import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";

export function PrestamosTable() {
  const { prestamos, updatePrestamo } = useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const total = prestamos.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const sorted = (() => {
    const data = [...prestamos];
    return data.sort((a, b) => {
      const av = new Date(a.fechaDesembolso).getTime();
      const bv = new Date(b.fechaDesembolso).getTime();
      return sortDir === "asc" ? av - bv : bv - av;
    });
  })();
  const paginated = sorted.slice(startIdx, endIdx);

  const totalPrestado = prestamos.reduce((sum, p) => sum + p.monto, 0);
  const totalPendiente = prestamos.reduce(
    (sum, p) => sum + p.saldoPendiente,
    0
  );
  const activos = prestamos.filter((p) => p.estado === "activo").length;

  // Función para pagar cuota
  const pagarCuotaPrestamo = (prestamoId: string) => {
    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (prestamo && prestamo.estado === "activo") {
      const nuevasCuotasPagadas = prestamo.cuotasPagadas + 1;
      const nuevoSaldo = prestamo.saldoPendiente - prestamo.valorCuota;

      // Verificar si el préstamo está completamente pagado
      const estaCompletamentePagado =
        nuevasCuotasPagadas >= prestamo.numeroCuotas;
      const nuevoEstado = estaCompletamentePagado ? "finalizado" : "activo"; // Cambiado de "cancelado" a "finalizado"

      // Actualizar solo las propiedades que cambian (Partial<Prestamo>)
      updatePrestamo(prestamoId, {
        cuotasPagadas: nuevasCuotasPagadas,
        saldoPendiente: Math.max(0, nuevoSaldo), // Asegurar que no sea negativo
        estado: nuevoEstado,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Préstamos</CardTitle>
        <ExportButton
          data={prestamos.map((p) => ({
            empleado: p.empleado?.nombre || "N/A",
            monto: p.monto,
            valorCuota: p.valorCuota,
            cuotasPagadas: p.cuotasPagadas,
            numeroCuotas: p.numeroCuotas,
            saldoPendiente: p.saldoPendiente,
            fechaDesembolso: p.fechaDesembolso,
            estado: p.estado === "activo" ? "Activo" : "Finalizado",
          }))}
          headers={[
            "Empleado",
            "Monto",
            "Cuota",
            "Cuotas Pagadas",
            "Nº Cuotas",
            "Saldo",
            "Fecha",
            "Estado",
          ]}
          keys={[
            "empleado",
            "monto",
            "valorCuota",
            "cuotasPagadas",
            "numeroCuotas",
            "saldoPendiente",
            "fechaDesembolso",
            "estado",
          ]}
          title="Gestión de Préstamos"
          filename="prestamos"
          enableFilter
          dateField="fechaDesembolso"
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4 h-full min-h-[96px] flex flex-col justify-center gap-1">
            <p className="text-sm text-muted-foreground">Total Prestado</p>
            <p className="text-2xl font-bold text-foreground">
              ${totalPrestado.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4 h-full min-h-[96px] flex flex-col justify-center gap-1">
            <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
            <p className="text-2xl font-bold text-red-600">
              ${totalPendiente.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4 h-full min-h-[96px] flex flex-col justify-center gap-1">
            <p className="text-sm text-muted-foreground">Préstamos Activos</p>
            <p className="text-2xl font-bold text-foreground">{activos}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
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
              <SelectTrigger className="w-[160px]">
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
            No hay préstamos para los filtros seleccionados.
          </div>
        ) : (
          <div key={`${pageSize}-${page}`} className="overflow-x-auto overflow-y-auto max-h-[540px] animate-in fade-in duration-200 rounded-md border border-border responsive-table">
            <Table className="text-sm table-auto md:table-fixed min-w-[1000px]">
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-xs md:text-sm">
              <TableRow>
                <TableHead className="truncate max-w-[160px]">Empleado</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Cuota</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] min-w-[120px] text-right">Acción</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="animate-in fade-in duration-200">
                {paginated.map((prestamo) => {
                const progreso =
                  (prestamo.cuotasPagadas / prestamo.numeroCuotas) * 100;
                return (
                  <TableRow key={prestamo.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                    <TableCell className="font-medium truncate max-w-[160px]">
                      {prestamo.empleado?.nombre || "Empleado no encontrado"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      ${prestamo.monto.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      ${prestamo.valorCuota.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={progreso} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {prestamo.cuotasPagadas}/{prestamo.numeroCuotas}{" "}
                          cuotas
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                      ${prestamo.saldoPendiente.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(prestamo.fechaDesembolso).toLocaleDateString(
                        "es-ES"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          prestamo.estado === "activo"
                            ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200"
                        )}
                      >
                        {prestamo.estado === "activo" ? "Activo" : "Finalizado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[120px] min-w-[120px] text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {prestamo.estado === "activo" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => pagarCuotaPrestamo(prestamo.id)}
                          >
                            <DollarSign className="h-3 w-3" />
                            Pagar
                          </Button>
                        )}
                      </div>
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
