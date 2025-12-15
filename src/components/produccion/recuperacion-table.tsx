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
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/src/components/ui/badge";
import { ExportButton } from "@/src/components/shared/export-button";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";

export function RecuperacionTable() {
  const { recuperacionCintas } = useApp();
  const searchParams = useSearchParams();
  const fincaFilter = searchParams.get("finca") || "";

  const filtered = useMemo(() => {
    return recuperacionCintas.filter((r) =>
      fincaFilter ? r.finca === fincaFilter : true
    );
  }, [recuperacionCintas, fincaFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const paginated = filtered.slice(startIdx, endIdx);

  const avgRecuperacion =
    filtered.reduce((sum, r) => sum + r.porcentajeRecuperacion, 0) /
    (filtered.length || 1);

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
          data={filtered}
          headers={[
            "Finca",
            "Semana",
            "Iniciales",
            "1ª Cal",
            "2ª Cal",
            "3ª Cal",
            "Barrida",
            "Recuperación",
          ]}
          keys={[
            "finca",
            "semana",
            "enfundesIniciales",
            "primeraCalCosecha",
            "segundaCalCosecha",
            "terceraCalCosecha",
            "barridaFinal",
            "porcentajeRecuperacion",
          ]}
          title="Historial de Recuperación"
          filename="recuperacion-cintas"
          enableFilter
          weekField="semana"
          yearField="año"
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

        <div className="flex items-center gap-2 mb-4">
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
              {paginated.map((rec) => (
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
